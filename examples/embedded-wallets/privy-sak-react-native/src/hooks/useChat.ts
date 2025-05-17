import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  appendResponseMessages,
  type CoreAssistantMessage,
  type CoreToolMessage,
  generateText,
  type Message,
} from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import { SolanaAgentKit, createVercelAITools } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { 
  fetchChat, 
  fetchMessages, 
  saveChat, 
  saveMessages, 
  generateUUID, 
  deleteChat as deleteChatAPI,
  createOrUpdateUser
} from "@/lib/utils";
import { myProvider } from "@/lib/ai/providers";
import { HELIUS_STAKED_URL } from "@env";
import { useWallet } from "@/walletProviders";
import { ensureBuffer } from "@/polyfills";

// Ensure Buffer is available before executing any code
ensureBuffer();

// Improved polyfill for structuredClone
export function safeDeepClone<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  try {
    // Try the JSON method first as our reliable fallback
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn("Deep clone failed:", error);
    
    // Handle circular references or non-serializable objects
    if (Array.isArray(obj)) {
      return obj.map(item => safeDeepClone(item)) as unknown as T;
    } else if (typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = safeDeepClone((obj as Record<string, any>)[key]);
        }
      }
      return result as unknown as T;
    }
    
    // Fallback to returning the original if all else fails
    return obj;
  }
}

// Setup structuredClone polyfill immediately on module load
if (typeof global !== 'undefined') {
  if (!global.structuredClone) {
    (global as any).structuredClone = safeDeepClone;
  }
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

interface UseChatOptions {
  id: string;
  initialMessages?: Message[];
  selectedChatModel?: string;
  isExistingChat?: boolean;
}
type Status = "submitted" | "streaming" | "ready" | "error";
type Reload = UseChatHelpers["reload"];
type Stop = UseChatHelpers["stop"];

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel("title-model"),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export function useChat({ id, initialMessages = [], isExistingChat = false }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<Status>("ready");
  const initialFetchDone = useRef(false);
  
  // Processing step tracking for genuine status updates
  const [currentOperation, setCurrentOperation] = useState<string>("");
  
  // Use the wallet hook to access Privy wallet functionality
  const { connected, publicKey, address, signTransaction, signMessage, sendTransaction, signAllTransactions } = useWallet();
  
  // Get the user's wallet address
  const walletAddress = address || publicKey?.toString();

  // Maximum number of messages to include in AI context to prevent token limits
  const MAX_CONTEXT_MESSAGES = 10;

  // Get latest messages for AI context
  const getContextMessages = useCallback((allMessages: Message[]): Message[] => {
    // Always include at least the latest few messages
    if (allMessages.length <= MAX_CONTEXT_MESSAGES) {
      return allMessages;
    }
    
    // Include at least the last message
    const lastMessage = allMessages[allMessages.length - 1];
    
    // For longer conversations, keep the first system message and the most recent messages
    return [
      // Find and include any system messages from the beginning
      ...allMessages.filter((msg, idx) => idx < 2 && msg.role === 'system'),
      // Then take the most recent messages to fill up to MAX_CONTEXT_MESSAGES
      ...allMessages.slice(-MAX_CONTEXT_MESSAGES + 1),
    ];
  }, []);

  // Ensure user record exists in the database when connected
  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (connected && address) {
        try {
          await createOrUpdateUser({
            walletAddress: address,
          });
          console.log("User created or verified in database");
        } catch (err) {
          console.error("Failed to create user:", err);
        }
      }
    };
    
    createUserIfNeeded();
  }, [connected, address]);

  // Only set initialMessages on first mount
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, []); // Empty dependency array ensures this only runs once

  // Fetch initial messages if any
  useEffect(() => {
    // Skip if we've already fetched or if initialMessages were provided
    if (initialFetchDone.current || initialMessages.length > 0) {
      return;
    }

    const fetchInitialMessages = async () => {
      if (!id || !connected || !address) return;
      
      // For new chats (not coming from ChatHistory), skip API calls to avoid 404s
      if (!isExistingChat) {
        initialFetchDone.current = true;
        return;
      }
      
      try {
        // Check if chat exists first before trying to fetch messages
        const chat = await fetchChat(id, address);
        
        // Only try to fetch messages if chat exists
        if (chat) {
          initialFetchDone.current = true; // Mark as done
          const fetchedMessages = await fetchMessages(id, address);
          
          if (fetchedMessages.length > 0) {
            // Convert to Message format expected by AI SDK
            const formattedMessages = fetchedMessages.map(msg => ({
              id: msg.id,
              content: msg.parts.find((part: { type: string; text: string }) => part.type === 'text')?.text || '',
              role: msg.role as Message["role"],
              parts: msg.parts,
              experimental_attachments: msg.attachments || [],
            }));
            setMessages(formattedMessages as Message[]);
          }
        } else {
          // Chat doesn't exist yet, so we shouldn't try to fetch messages
          // Just mark as done to avoid further attempts
          initialFetchDone.current = true;
        }
      } catch (error) {
        // Don't show errors for 404s (expected for new chats)
        if (!(error instanceof Error && error.message.includes('404'))) {
          console.error("Error fetching messages:", error);
          setError("Failed to fetch messages. Please try again.");
        }
        initialFetchDone.current = true; // Mark as done even on error to prevent repeated attempts
      }
    };

    // Only fetch messages if wallet is connected
    if (connected && address) {
      fetchInitialMessages();
    } else {
      initialFetchDone.current = false; // Reset so we can try again when connected
    }
  }, [id, connected, address, initialMessages.length, isExistingChat]);

  const solanaTools = useMemo(() => {
    if (connected && address) {
      const agent = new SolanaAgentKit(
        {
          publicKey: new PublicKey(address),
          signTransaction: async tx => {
            setCurrentOperation("Waiting for transaction signature...");
            return await signTransaction(tx) as any;
          },
          signMessage: async msg => {
            setCurrentOperation("Waiting for message signature...");
            return await signMessage(msg);
          },
          sendTransaction: async tx => {
            setCurrentOperation("Sending transaction to Solana network...");
            const connection = new Connection(HELIUS_STAKED_URL, 'confirmed');
            return await sendTransaction(tx, connection);
          },
          signAllTransactions: async txs => {
            setCurrentOperation("Waiting for batch transaction signatures...");
            return await signAllTransactions(txs) as any;
          },
          signAndSendTransaction: async tx => {
            setCurrentOperation("Signing and sending transaction...");
            const connection = new Connection(HELIUS_STAKED_URL, 'confirmed');
            const signature = await sendTransaction(tx, connection);
            return { signature };
          },
        },
        HELIUS_STAKED_URL,
        {},
      ).use(TokenPlugin as any);
      const tools = createVercelAITools(agent, agent.actions);
      return tools;
    }
  }, [connected, address, publicKey, signTransaction, signMessage, sendTransaction, signAllTransactions]);

  const append = useCallback(
    (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      return newMessage.content;
    },
    [],
  );

  const reload: Reload = async (chatOptions) => {
    return null;
  };

  const stop: Stop = async () => {
    setStatus("ready");
    setIsLoading(false);
  };

  const sendMessage = useCallback(
    async (newMessage?: Message) => {
      setStatus("submitted");
      setCurrentOperation("Initializing AI assistant...");

      // Ensure wallet is connected
      if (!connected || !address) {
        setError("You must be connected to your wallet to send messages");
        setStatus("error");
        return;
      }

      setIsLoading(true);
      setError(null);

      // Update UI immediately with the new message
      if (newMessage) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }

      const lastMessage = newMessage ?? (messages[messages.length - 1] as Message);
      
      // Helper to detect transaction-related keywords in user messages
      const isTransactionRelated = (content: string): boolean => {
        const lowerContent = content.toLowerCase();
        return lowerContent.includes('transaction') || 
               lowerContent.includes('send') || 
               lowerContent.includes('transfer') || 
               lowerContent.includes('swap') || 
               lowerContent.includes('buy') || 
               lowerContent.includes('sell') || 
               lowerContent.includes('exchange') ||
               lowerContent.includes('trade');
      };
      
      // Max number of retries for transaction operations
      const MAX_RETRIES = 2;
      let retryCount = 0;
      
      const executeWithRetry = async (operation: () => Promise<any>): Promise<any> => {
        try {
          return await operation();
        } catch (error) {
          // Check if we should retry based on message content and retry count
          const messageContent = typeof lastMessage.content === 'string' ? lastMessage.content : '';
          const shouldRetry = isTransactionRelated(messageContent) && retryCount < MAX_RETRIES;
          
          if (shouldRetry) {
            retryCount++;
            console.log(`Retrying operation (${retryCount}/${MAX_RETRIES})...`);
            setCurrentOperation(`Network request failed. Retrying (${retryCount}/${MAX_RETRIES})...`);
            
            // Add a small delay before retrying to allow services to initialize
            await new Promise(resolve => setTimeout(resolve, 1500));
            return executeWithRetry(operation);
          }
          
          // If we've exhausted retries or it's not a transaction message, rethrow
          throw error;
        }
      };

      try {
        // Check if chat exists
        setCurrentOperation("Checking chat history...");
        const chat = await fetchChat(id, address);

        // Always create/update the chat before proceeding
        if (!chat) {
          setCurrentOperation("Creating new conversation...");
          const title = await generateTitleFromUserMessage({
            message: lastMessage,
          });
          
          // Create chat first
          const chatResult = await saveChat({
            id,
            title,
          }, address);
          
          if (!chatResult) {
            throw new Error("Failed to create chat");
          }
        }

        if (newMessage) {
          // Prepare a clean message object with explicit text field
          // This is critical for server validation
          setCurrentOperation("Processing your message...");
          const formattedMessage = {
            id: lastMessage.id,
            chatId: id,
            role: lastMessage.role,
            parts: [
              {
                type: 'text',
                text: typeof lastMessage.content === 'string' ? lastMessage.content : ''
              }
            ],
            attachments: [],
            createdAt: new Date(),
          };
          
          // Save the user message with explicitly formatted parts
          const saveResult = await saveMessages([formattedMessage], address);
          
          if (saveResult === "failed") {
            throw new Error("Failed to save user message");
          }
        }
        // Generate response
        if (address) {
          const contextMessages = getContextMessages(newMessage ? [...messages, newMessage] : messages);
          
          // Determine if input suggests certain operations (for more accurate status updates)
          const userInput = typeof lastMessage.content === 'string' ? lastMessage.content.toLowerCase() : '';
          
          // Set operation based on user input keywords
          if (userInput.includes('portfolio') || userInput.includes('balance') || userInput.includes('token')) {
            setCurrentOperation("Fetching wallet portfolio data...");
          } else if (userInput.includes('transaction') || userInput.includes('send') || userInput.includes('transfer')) {
            setCurrentOperation("Preparing transaction details...");
          } else if (userInput.includes('nft') || userInput.includes('collectible')) {
            setCurrentOperation("Searching for NFT data...");
          } else if (userInput.includes('price') || userInput.includes('market')) {
            setCurrentOperation("Getting latest market information...");
          } else if (userInput.includes('sign')) {
            setCurrentOperation("Preparing signature request...");
          } else if (userInput.includes('wallet')) {
            setCurrentOperation("Retrieving wallet information...");
          } else if (userInput.includes('swap')) {
            setCurrentOperation("Calculating swap parameters...");
          } else {
            setCurrentOperation("Generating AI response...");
          }
          
          // Set operation updates based on timing for a more natural flow
          const operationTimer = setTimeout(() => {
            setCurrentOperation("Analyzing Solana blockchain data...");
            
            // Chain of operations for a more natural flow
            const secondTimer = setTimeout(() => {
              setCurrentOperation("Processing information...");
              
              const thirdTimer = setTimeout(() => {
                setCurrentOperation("Preparing response...");
              }, 3000);
              
              return () => clearTimeout(thirdTimer);
            }, 3000);
            
            return () => clearTimeout(secondTimer);
          }, 3000);
          
          // Wrap the AI generation in retry logic
          const res = await executeWithRetry(async () => {
            return generateText({
              model: myProvider.languageModel("chat-model"),
              system:
                `You're a helpful Solana assistant that helps people carry out transactions and actions on the Solana blockchain. You can only perform actions and answer questions related to Solana.
                
                USER'S WALLET INFORMATION:
                - Connected wallet address: ${walletAddress}
                
                When the user asks about their wallet address or wallet details, you SHOULD directly provide this information.`,
              messages: contextMessages,
              maxSteps: 5,
              experimental_generateMessageId: generateUUID,
              tools: solanaTools,
            });
          });
          
          // Clear operation timer once response is received
          clearTimeout(operationTimer);

          try {
            setCurrentOperation("Finalizing response...");
            // Validate that we have a response with messages
            if (!res.response || !res.response.messages || res.response.messages.length === 0) {
              console.error("AI returned no response messages");
              throw new Error("AI assistant returned an empty response");
            }
            
            // Filter for assistant messages
            const assistantMessages = res.response.messages.filter(
              (message: ResponseMessage) => message.role === "assistant",
            );
            
            if (assistantMessages.length === 0) {
              console.error("No assistant messages found in response");
              throw new Error("AI assistant did not provide a response");
            }
            
            const assistantId = getTrailingMessageId({ messages: assistantMessages });

            if (!assistantId) {
              console.error("No valid message ID found in assistant messages");
              throw new Error("No assistant message found!");
            }

            const [, assistantMessage] = appendResponseMessages({
              messages: [lastMessage],
              responseMessages: res.response.messages,
            });

            // Ensure assistant message content is valid and not empty
            const messageContent = typeof assistantMessage.content === 'string' 
              ? assistantMessage.content 
              : JSON.stringify(assistantMessage.content);
                
            if (!messageContent || messageContent.trim() === '') {
              console.warn("Empty message content detected, using fallback text");
              throw new Error("Empty response from assistant");
            }

            // Create a clean message object for the assistant
            const formattedAssistantMessage = {
              id: assistantId,
              chatId: id,
              role: assistantMessage.role,
              parts: [
                {
                  type: 'text',
                  text: messageContent
                }
              ],
              attachments: [],
              createdAt: new Date(),
            };

            const saveRes = await saveMessages([formattedAssistantMessage], address);

            if (saveRes === "failed") {
              throw new Error("Failed to save chat");
            }

            // Update the UI with the assistant's response
            setMessages((currentMessages) => [
              ...currentMessages,
              {
                content: assistantMessage.content,
                id: assistantMessage.id,
                parts: assistantMessage.parts || [{ type: 'text', text: assistantMessage.content }],
                role: "assistant",
              },
            ]);

            setStatus("ready");
            setCurrentOperation("");
          } catch (e) {
            console.error("Failed to save chat:", e);
            setStatus("error");
            setError("Failed to save response. Please try again.");
            setCurrentOperation("");
          }
        }
      } catch (err) {
        setStatus("error");
        console.error("Error in chat:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while processing your request",
        );
        setCurrentOperation("");
      } finally {
        setIsLoading(false);
      }
    },
    [id, messages, solanaTools, address, connected, walletAddress],
  );

  // Prevent automatic message sending on first load
  useLayoutEffect(() => {
    // Only trigger auto-send when explicitly ready and there's a user message
    const lastMessage = messages[messages.length - 1];
    const shouldAutoSend = 
      lastMessage?.role === "user" && 
      status === "ready" && 
      !isLoading && 
      // Prevent sending on initial load
      initialFetchDone.current;
      
    if (shouldAutoSend) {
      sendMessage();
    }
  }, [messages, status, isLoading, sendMessage]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      const messageContent = input;
      if (!messageContent) {
        setError("Message cannot be empty");
        return;
      }
      const newMessage: Message = {
        id: generateUUID(),
        content: messageContent,
        role: "user",
        parts: [{ type: "text" as const, text: messageContent }],
      };
      sendMessage(newMessage);
      e?.currentTarget.reset();
    },
    [sendMessage, input],
  );

  const deleteChat = useCallback(async () => {
    if (!connected || !address) {
      setError("You must be connected to your wallet to delete chats");
      return false;
    }

    try {
      const chat = await fetchChat(id, address);

      if (!chat) {
        setError("Chat not found");
        return false;
      }

      const success = await deleteChatAPI(id, address);
      return success;
    } catch (err) {
      console.error("Error deleting chat:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while deleting the chat",
      );
      return false;
    }
  }, [id, address, connected]);

  return {
    messages,
    isLoading,
    error,
    setMessages,
    sendMessage,
    deleteChat,
    append,
    handleSubmit,
    reload,
    stop,
    input,
    setInput,
    status,
    setError,
    currentOperation,
  };
}
