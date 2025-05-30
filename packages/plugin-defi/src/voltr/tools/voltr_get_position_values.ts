import { PublicKey } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import type { SolanaAgentKit } from "solana-agent-kit";

/**
 * Gets the value of assets in a Voltr vault
 * @param agent SolanaAgentKit instance
 * @param vault Public key of the target vault
 * @returns Position and total values for the vault
 */
export async function voltrGetPositionValues(
  agent: SolanaAgentKit,
  vault: PublicKey,
): Promise<string> {
  const vc = new VoltrClient(agent.connection);
  const positionAndTotalValues =
    await vc.getPositionAndTotalValuesForVault(vault);

  return JSON.stringify(positionAndTotalValues);
}
