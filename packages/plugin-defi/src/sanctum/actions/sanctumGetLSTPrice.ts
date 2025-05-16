import type { Action, SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { sanctumGetLSTPrice } from "../tools";

export const sanctumGetLSTPriceAction: Action = {
  name: "GET_SANCTUM_PRICE",
  similes: ["get sanctum LST price", "fetch sanctum LST price"],
  description:
    "Fetch the Price of a LST(Liquid Staking Token) on Sanctum with specified mint addresses or symbols",
  examples: [
    [
      {
        input: {
          inputs: [
            "INF",
            "pwrsol",
            "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            "laineSOL",
          ],
        },
        output: {
          INF: "1303329251",
          laineSOL: "1221330946",
          mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "1279055247",
          pwrsol: "1105899448",
        },
        explanation: "Fetch the prices of LSTs on Sanctum",
      },
    ],
  ],
  schema: z.object({
    mints: z.array(z.string()),
  }),
  handler: async (_agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const prices = await sanctumGetLSTPrice(input.mints);

      return {
        status: "success",
        message: "Price fetched successfully",
        prices: prices,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Fetching Sanctum LST price failed: ${error.message}`,
      };
    }
  },
};
