import {
  SolanaAgentKit,
  createLangchainTools,
  KeypairWallet,
} from "solana-agent-kit";
import { Keypair } from "@solana/web3.js";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import bs58 from "bs58";
import { MemorySaver } from "@langchain/langgraph";

dotenv.config();

function validateEnvironment(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "RPC_URL", "SOLANA_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

validateEnvironment();

const WALLET_DATA_FILE = "wallet_data.txt";

async function initializeAgent(system_prompt: string) {
  try {
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.3,
    });

    let walletDataStr: string | null = null;

    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
      }
    }

    const decodedPrivateKey = bs58.decode(
      process.env.SOLANA_PRIVATE_KEY as string,
    );
    const keypair = Keypair.fromSecretKey(decodedPrivateKey);
    const keypairWallet = new KeypairWallet(
      keypair,
      process.env.RPC_URL as string,
    );

    const solanaAgent = new SolanaAgentKit(
      keypairWallet,
      process.env.RPC_URL as string,
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
        HELIUS_API_KEY: process.env.HELIUS_API_KEY!,
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY!,
      },
    );

    const tools = createLangchainTools(solanaAgent, solanaAgent.actions);

    const memory = new MemorySaver();
    const config = { configurable: { thread_id: "Solana Agent Kit!" } };

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        ${system_prompt}. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
      `,
    });

    if (walletDataStr) {
      fs.writeFileSync(WALLET_DATA_FILE, walletDataStr);
    }

    return { agent, config };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log("Starting autonomous mode...");

  while (true) {
    try {
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const stream = await agent.stream(
        { messages: [new HumanMessage(thought)] },
        config,
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }

      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}

async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const stream = await agent.stream(
        { messages: [new HumanMessage(userInput)] },
        config,
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function chooseMode(): Promise<"chat" | "auto"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat    - Interactive chat mode");
    console.log("2. auto    - Autonomous action mode");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    rl.close();

    if (choice === "1" || choice === "chat") {
      return "chat";
    } else if (choice === "2" || choice === "auto") {
      return "auto";
    }
    console.log("Invalid choice. Please try again.");
  }
}

async function choosePersonality(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log("************\nPersonality Selection:");

  while (true) {
    const choice = (
      await question(
        "What is the name of the celebrity/person/character that you would like to create?\n************\n\n",
      )
    ).toLowerCase();

    rl.close();

    const selected_chatbot_prompt = await fetchOrbofiPersonality(choice);
    return selected_chatbot_prompt;
  }
}

async function fetchOrbofiPersonality(celebrity_name: String) {
  const url = `https://api.orbofi.com/bots/getBotData?bot_name=${celebrity_name}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseDataTmp = await response.json();
    const responseData = JSON.parse(responseDataTmp.results);

    let selected_chatbot_prompt = responseData[0]["description"];

    console.log(`Fetched personality: ${selected_chatbot_prompt}`);

    return selected_chatbot_prompt;
  } catch (error) {
    console.error("Error fetching chatbot list:", error);
    return [];
  }
}

async function main() {
  try {
    console.log("Starting Agent...");

    const selected_chatbot_prompt = await choosePersonality();

    const { agent, config } = await initializeAgent(selected_chatbot_prompt);
    const mode = await chooseMode();

    if (mode === "chat") {
      await runChatMode(agent, config);
    } else {
      await runAutonomousMode(agent, config);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
