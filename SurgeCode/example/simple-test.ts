import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import fs from "fs";

const HELIUS_RPC_URL = "";

// Simple function to get or create a keypair
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const keyPath = dir + "/" + keyName + ".json";
  
  if (fs.existsSync(keyPath)) {
    try {
      // Try to read Keypair JSON format directly
      return Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(keyPath, 'utf-8')))
      );
    } catch (e) {
      console.log("Unable to read key file, generating new key");
      const keypair = Keypair.generate();
      fs.writeFileSync(keyPath, JSON.stringify(Array.from(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀)));
      return keypair;
    }
  } else {
    const keypair = Keypair.generate();
    fs.writeFileSync(keyPath, JSON.stringify(Array.from(keypair.secretKey)));
    return keypair;
  }
}

async function main() {
  try {
    console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    
    // Create connection and Provider
    const connection = new Connection(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    
    // Create temporary test directory
    const KEYS_FOLDER = __dirname + "/.keys";
    
    // Get test account
    const testAccount = getOrCreateKeypair(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    console.log("Test account:", testAccount.publicKey.toBase58());
    
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    const wallet = new NodeWallet(testAccount);
    
    // Create Provider
    const provider = new AnchorProvider(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    const sdk = new PumpFunSDK(provider);
    
    // Get account SOL balance
    const solBalance = await connection.getBalance(testAccount.publicKey);
    console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    
    // Get global account
    console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    const globalAccount = await sdk.getGlobalAccount();
    console.log("Global account data:", globalAccount);
    
    console.log("Test complete");
  } catch (error) {
    console.error("Test error:", error);
  }
}

⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
