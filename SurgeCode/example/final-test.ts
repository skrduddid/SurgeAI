import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { DEFAULT_DECIMALS, PumpFunSDK } from "../src";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AnchorProvider } from "@coral-xyz/anchor";
import fs from "fs";

// Use Helius RPC URL
const HELIUS_RPC_URL = "";
const KEYS_FOLDER = __dirname + "/.keys";
const SLIPPAGE_BASIS_POINTS = 100n;

// Simple function to get or create a keypair
function getOrCreateKeypair(dir: string, keyName: string): Keypair {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const keyPath = dir + "/" + keyName + ".json";
  
  if (fs.existsSync(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀)) {
    try {
      // Try to read Keypair JSON format directly
      return Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(keyPath, 'utf-8')))
      );
    } catch (e) {
      console.log("Unable to read key file, generating new key");
      const keypair = Keypair.generate();
      fs.writeFileSync(keyPath, JSON.stringify(Array.from(keypair.secretKey)));
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    }
  } else {
    const keypair = Keypair.generate();
    fs.writeFileSync(keyPath, JSON.stringify(Array.from(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀)));
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
  }
}

// Print SOL balance
async function printSOLBalance(connection: Connection, pubKey: PublicKey, info: string = "") {
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
  console.log(`${info ? info + " " : ""}${pubKey.toBase58()}:`, balance / LAMPORTS_PER_SOL, 'SOL');
  return balance;
}

async function main() {
  try {
    console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    console.log("Connecting to Solana network...");
    const connection = new Connection(HELIUS_RPC_URL);
    
    // Get test account
    const testAccount = getOrCreateKeypair(KEYS_FOLDER, "test-account");
    console.log("Test account:", testAccount.publicKey.toBase58());
    
    // Create wallet and Provider
    const wallet = new NodeWallet(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    const provider = new AnchorProvider(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    
    // Initialize SDK
    console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    const sdk = new PumpFunSDK(provider);
    
    // Get account SOL balance
    const solBalance = await printSOLBalance(connection, testAccount.publicKey, "Test Account");
    
    if (solBalance === 0) {
      console.log("WARNING: Test account has no SOL, cannot execute transactions");
      console.log("Please send some SOL to this address and try again:", testAccount.publicKey.toBase58());
    }
    
    // Get and create mint Keypair
    const mint = getOrCreateKeypair(KEYS_FOLDER, "mint");
    console.log("Mint address:", mint.publicKey.toBase58());
    
    // Get global account
    console.log("Getting global account...");
    const globalAccount = await sdk.getGlobalAccount();
    console.log("Global account data:", globalAccount);
    
    // Check if bonding curve account already exists
    console.log("Checking bonding curve account...");
    const boundingCurveAccount = await sdk.getBondingCurveAccount(mint.publicKey);
    
    if (boundingCurveAccount) {
      console.log("Bonding curve account already exists:", boundingCurveAccount);
      console.log(`View link: https://pump.fun/${mint.publicKey.toBase58()}`);
    } else {
      console.log("Bonding curve account does not exist, needs to be created first");
      
      if (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
        console.log("If there is enough SOL, a new token can be created");
        // Creating a token requires solBalance > 0
      }
    }
    
    console.log("=== Test Complete ===");
  } catch (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
    console.error(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
  }
}

main().catch(console.error); 
