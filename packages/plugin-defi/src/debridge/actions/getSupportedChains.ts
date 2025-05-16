import { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { getDebridgeSupportedChains } from "../tools/get_supported_chains";

const getDebridgeSupportedChainsAction: Action = {
  name: "DEBRIDGE_GET_SUPPORTED_CHAINS",
  description:
    "Fetch the list of chains supported by deBridge for cross-chain token transfers",
  similes: [
    "list supported chains for bridging",
    "show available chains for cross-chain transfer",
    "what chains can I bridge between",
    "check if a chain is supported for bridging",
    "get chain IDs for cross-chain transfer",
  ],
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          chains: [
            {
              chainId: "1",
              originalChainId: "1",
              chainName: "Ethereum",
            },
            {
              chainId: "7565164",
              originalChainId: "7565164",
              chainName: "Solana",
            },
          ],
          message: "Retrieved supported chains",
        },
        explanation: "Get the list of chains supported by deBridge",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (_agent: SolanaAgentKit, _input: Record<string, any>) => {
    try {
      const response = await getDebridgeSupportedChains();
      return {
        status: "success",
        ...response,
        message: "Retrieved supported chains",
      };
    } catch (error: any) {
      console.error("Error in getDebridgeSupportedChains action:", error);
      return {
        status: "error",
        message: `Failed to fetch supported chains: ${error.message}`,
      };
    }
  },
};

export default getDebridgeSupportedChainsAction;
