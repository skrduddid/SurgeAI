import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { Action } from "solana-agent-kit";
import { z } from "zod";
import { deploy_token } from "../tools";

const deployTokenAction: Action = {
  name: "DEPLOY_TOKEN",
  similes: [
    "create token",
    "launch token",
    "deploy new token",
    "create new token",
    "mint token",
  ],
  description:
    "Deploy a new SPL token on the Solana blockchain with specified parameters",
  examples: [
    [
      {
        input: {
          name: "My Token",
          uri: "https://example.com/token.json",
          symbol: "MTK",
          decimals: 9,
          authority: {
            mintAuthority: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
            freezeAuthority: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
            updateAuthority: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
            isMutable: true,
          },
          initialSupply: 1000000,
        },
        output: {
          mint: "7nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkN",
          status: "success",
          message: "Token deployed successfully",
        },
        explanation: "Deploy a token with initial supply and metadata",
      },
    ],
    [
      {
        input: {
          name: "Basic Token",
          uri: "https://example.com/basic.json",
          symbol: "BASIC",
          authority: {
            mintAuthority: undefined,
            freezeAuthority: undefined,
            updateAuthority: undefined,
            isMutable: true,
          },
        },
        output: {
          mint: "8nE9GvcwsqzYxmJLSrYmSB1V1YoJWVK1KWzAcWAzjXkM",
          status: "success",
          message: "Token deployed successfully",
        },
        explanation: "Deploy a basic token with minimal parameters",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(1, "Name is required"),
    uri: z.string().url("URI must be a valid URL"),
    symbol: z.string().min(1, "Symbol is required"),
    decimals: z.number().optional(),
    authority: z
      .object({
        mintAuthority: z.string().nullable().optional(),
        freezeAuthority: z.string().nullable().optional(),
        updateAuthority: z.string().nullable().optional(),
        isMutable: z.boolean().optional(),
      })
      .optional(),
    initialSupply: z.number().optional(),
  }),
  handler: async (agent, input: Record<string, any>) => {
    try {
      const result = await deploy_token(
        agent,
        input.name,
        input.uri,
        input.symbol,
        input.authority,
        input.decimals,
        input.initialSupply,
      );

      if (
        result instanceof Transaction ||
        result instanceof VersionedTransaction
      ) {
        return {
          status: "success",
          message: "Transaction generated successfully",
          transaction: result,
        };
      }

      return {
        mint: result.mint.toBase58(),
        status: "success",
        message: "Token deployed successfully",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Token deployment failed: ${error.message}`,
      };
    }
  },
};

export default deployTokenAction;
