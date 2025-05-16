import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * Request SOL from the Solana faucet (devnet/testnet only)
 * @param agent - SolanaAgentKit instance
 * @returns Transaction signature
 * @throws Error if the request fails or times out
 */
export async function request_faucet_funds(
  agent: SolanaAgentKit,
): Promise<string> {
  const tx = await agent.connection.requestAirdrop(
    agent.wallet.publicKey,
    5 * LAMPORTS_PER_SOL,
  );

  const latestBlockHash = await agent.connection.getLatestBlockhash();

  await agent.connection.confirmTransaction({
    signature: tx,
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  });

  return tx;
}
