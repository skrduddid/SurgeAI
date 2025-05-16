import { VersionedTransaction } from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Withdraw tokens for yields using Lulo
 * @param agent SolanaAgentKit instance
 * @param mintAddress SPL Mint address
 * @param amount Amount to withdraw
 * @returns Transaction signature
 */
export async function luloWithdraw(
  agent: SolanaAgentKit,
  mintAddress: string,
  amount: number,
) {
  try {
    const response = await fetch(
      `https://lulo.dial.to/api/actions/withdraw/${mintAddress}/${amount}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
        }),
      },
    );


    const data = await response.json();

    // Deserialize the transaction
    const luloTxn = VersionedTransaction.deserialize(
      Buffer.from(data.transaction, "base64"),
    );

    // Get a recent blockhash and set it
    const { blockhash } = await agent.connection.getLatestBlockhash();
    luloTxn.message.recentBlockhash = blockhash;

    return signOrSendTX(agent, luloTxn);
  } catch (error: any) {
    throw new Error(`Lending failed: ${error.message}`);
  }
}
