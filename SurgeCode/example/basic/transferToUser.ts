import { Connection, Keypair, sendAndConfirmTransaction, PublicKey, Transaction } from '@solana/web3.js';
import {
    createTransferCheckedInstruction,
    getAssociatedTokenAddress,
    getOrCreateAssociatedTokenAccount,
    getAccount,
} from '@solana/spl-token';

const decimals = 6; // Assume token precision is 6

export async function transferToUser(
    connection: Connection,
    testAccount: Keypair,
    mintPublicKey: PublicKey,
    userList: { secretKey: string, publicKey: string, needAmount: number }[]
) {
    // Amount of tokens to send (in the smallest unit of the token, e.g., lamports)

    try {
        // Get sender ATA
        const senderTokenAccount = await getAssociatedTokenAddress(
            mintPublicKey,
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
        );

        // Check sender balance
        const senderBalance = await getAccount(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);

        // Ensure receiver ATA exists (batch operations can lead to high fees, enable parallel execution)
        const receiverTokenAccount: { publicKey: PublicKey, needAmount: number }[] = [];
        let totalNeedAmount = userList.reduce(
            (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) => sum + item.needAmount,
            0
        );

        // Batch create ATA (each user account here should have at least 0.001 SOL, otherwise "Transaction failed: TokenAccountNotFoundError")
        // This will definitely error because batch creating ATA takes time, and block confirmation is needed to get the account
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
            try {
                // Get or create associated token account
                const account = await getOrCreateAssociatedTokenAccount(
                    connection,
                    testAccount,
                    mintPublicKey,
                    new PublicKey(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀)
                );

            } catch (error) {
                console.error(`Creating ATA for ${new PublicKey(userList[i].publicKey).toBase58()}...`);
            }
        }
        // Wait 5s for block confirmation to get the account
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
        console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
        await sleep(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀)
        // Call the above program again to get receiverTokenAccount
        for (let i = 0; i < userList.length; i++) {
            try {
                // Get or create associated token account
                const account = await getOrCreateAssociatedTokenAccount(
                    connection,
                    testAccount,
                    mintPublicKey,
                    new PublicKey(userList[i].publicKey)
                );
                console.log(`${i}. ${new PublicKey(userList[i].publicKey).toBase58()} ATA is ${account.address.toBase58()}`);
                // Get receiverTokenAccount
                receiverTokenAccount.push(
                    { publicKey: account.address, needAmount: Math.floor(userList[i].needAmount / totalNeedAmount * Number(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀))+1 },
                );
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
                console.error(`Failed for ${new PublicKey(userList[i].publicKey).toBase58()}:`, error);
            }
        }
        
        let transaction = new Transaction();

        // Add transfer instruction
        for (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {

            if (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
                receiverTokenAccount[i].needAmount = Number(senderBalance.amount);
            }
            transaction.add(
                createTransferCheckedInstruction(
                    senderTokenAccount,
                    mintPublicKey,
                    receiverTokenAccount[i].publicKey,
                    testAccount.publicKey,
                    receiverTokenAccount[i].needAmount,
                    decimals
                )
            );
            senderBalance.amount -= BigInt(receiverTokenAccount[i].needAmount);

            // Send and confirm transaction every 100 instructions (5 for testing)
            if (transaction.instructions.length >= 50) {
                const signature = await sendAndConfirmTransaction(
                    connection, transaction, [testAccount]
                );
                console.log('Transaction successful:', signature);
                transaction = new Transaction();
            }
        }
        // Send and confirm the last batch of instructions
        if (transaction.instructions.length > 0) {
            const signature = await sendAndConfirmTransaction(
                connection, transaction, [testAccount]
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
            console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
        }
    } catch (error) {
        console.error('Transaction failed:', error);
    }
}
