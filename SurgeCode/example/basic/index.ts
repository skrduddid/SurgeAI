// Import the dotenv library to load environment variables from a .env file.
import dotenv from "dotenv";
// Import the Node.js built-in fs (file system) module for file operations.
import fs from "fs";
// Import Connection, Keypair, and LAMPORTS_PER_SOL from the @solana/web3.js library.
// Connection is used to connect to a Solana RPC node.
// Keypair is used to generate and manage Solana key pairs.
// LAMPORTS_PER_SOL is a constant representing how many lamports (the smallest unit of SOL) are in one SOL.
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
// Import DEFAULT_DECIMALS and PumpFunSDK from the project's src directory.
// DEFAULT_DECIMALS is likely the default number of decimal places for a token.
// PumpFunSDK is the main SDK for interacting with the pump.fun platform.
import { DEFAULT_DECIMALS, PumpFunSDK } from "../../src";
// Import NodeWallet from @coral-xyz/anchor/dist/cjs/nodewallet, used to create a wallet in a Node.js environment.
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
// Import AnchorProvider from @coral-xyz/anchor, which is the provider for interacting with the Solana network in the Anchor framework.
import { AnchorProvider } from "@coral-xyz/anchor";
// Import utility functions from the ../util file.
// getOrCreateKeypair: Gets or creates a new keypair.
// getSPLBalance: Gets the balance of a specified SPL token.
// printSOLBalance: Prints the SOL balance.
// printSPLBalance: Prints the SPL token balance.
import {
  getOrCreateKeypair,
  getSPLBalance,
  printSOLBalance,
  printSPLBalance,
} from "../util";

⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
const KEYS_FOLDER = __dirname + "/.keys";
// Define the slippage tolerance in basis points. 100 basis points = 1%.
const SLIPPAGE_BASIS_POINTS = 100n;

// This is an example transaction link, showing how to view a token creation transaction on Solscan.
//create token example:
//https://solscan.io/tx/bok9NgPeoJPtYQHoDqJZyRDmY88tHbPcAk1CJJsKV3XEhHpaTZhUCG3mA9EQNXcaUfNSgfPkuVbEsKMp6H7D9NY
// This is a link to the Solana devnet faucet, used to get test SOL.
//devnet faucet
//https://faucet.solana.com/

// Define the main asynchronous function `main`, where the script's primary logic will be executed.
const main = async () => {
  // Call dotenv.config() to load environment variables defined in the .env file in the project's root directory.
  dotenv.config();
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
  // Check if the `HELIUS_RPC_URL` environment variable is set.
  if (!process.env.HELIUS_RPC_URL) {
    // If `HELIUS_RPC_URL` is not set, output an error message to the console.
    console.error("Please set HELIUS_RPC_URL in .env file");
    // Prompt the user with an example format for `HELIUS_RPC_URL`.
    console.error(
      "Example: HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<your api key>"
    );
    // Inform the user that they can get an API key from the Helius website.
    console.error(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    // Terminate function execution.
    return;
  }

  // Create a new `Connection` instance to interact with the Solana blockchain. Use the Helius RPC URL provided in the environment variables, or an empty string if not provided.
  let connection = new Connection(process.env.HELIUS_RPC_URL || "");

  // Create a new `NodeWallet` instance, using a newly generated `Keypair`. Note: The comment here indicates this wallet instance is not used in subsequent code.
  let wallet = new NodeWallet(new Keypair()); //note this is not used
  // Create an `AnchorProvider` instance. AnchorProvider is part of the Anchor framework and simplifies interaction with Solana programs.
  // `connection` is the previously created Solana connection instance.
  // `wallet` is the wallet instance (though it might not be used in this specific script).
  // `commitment: "finalized"` specifies the confirmation level required when reading state; "finalized" means waiting for the transaction to be finalized.
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "finalized",
  });

  // Call the `getOrCreateKeypair` function to try to load a keypair named "test-account" from `KEYS_FOLDER`. If it doesn't exist, create a new one and save it.
  const testAccount = getOrCreateKeypair(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
  // Call the `getOrCreateKeypair` function to try to load a keypair named "mint" from `KEYS_FOLDER`. This will be used as the mint address for the new token. If it doesn't exist, create a new one and save it.
  const mint = getOrCreateKeypair(KEYS_FOLDER, "mint");

  // Call the `printSOLBalance` function to print the SOL balance of "Test Account keypair" (i.e., `testAccount`).
  await printSOLBalance(
    connection, // Solana connection instance.
    testAccount.publicKey, // Public key of `testAccount`.
    "Test Account keypair" // Descriptive name for the account.
  );

  // Create an instance of `PumpFunSDK`, passing in the previously created `provider`. This SDK encapsulates the logic for interacting with the pump.fun platform.
  let sdk = new PumpFunSDK(provider);

  // Call the SDK's `getGlobalAccount` method asynchronously to get the global account information for the pump.fun platform.
  let globalAccount = await sdk.getGlobalAccount();
  // Print the retrieved global account information to the console.
  console.log(globalAccount);

  // Get the current SOL balance of `testAccount`.
  let currentSolBalance = await connection.getBalance(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
  // Check if the SOL balance of `testAccount` is 0.
  if (currentSolBalance == 0) {
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    console.log(
      "Please send some SOL to the test-account:",
      testAccount.publicKey.toBase58() // Convert the public key of `testAccount` to Base58 string format for easy copying.
    );
    // Terminate function execution.
    return;
  }

  // This line checks if a bonding curve account with the specified `mint.publicKey` already exists. This is a way to determine if the token has already been created on pump.fun.
  // Check if mint already exists
  let boundingCurveAccount = await sdk.getBondingCurveAccount(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
  // If `boundingCurveAccount` is null or undefined, it means the token has not yet been created.
  if (!boundingCurveAccount) {
    // Define the metadata for the new token.
    let tokenMetadata = {
      name: "0??test??TO", // Name of the token.
      symbol: "??test??", // Symbol or ticker of the token.
      description: "??test??: This is a ??test?? token", // Description of the token.
      twitter: "??test??.twitter", // Twitter link related to the token (placeholder).
      telegram: "https://t.me/??test??", // Telegram link related to the token (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀).
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
      file: "example/basic/random.png", // Path to the image for the token.
    };

    // Call the SDK's `createAndBuy` method to create the new token and perform an initial purchase using `testAccount`.
    let createResults = await sdk.createAndBuy(
      testAccount, // Keypair of the account used to pay for creation fees and buy tokens.
      mint, // Keypair of the new token's mint address.
      tokenMetadata, // Token metadata defined above.
      BigInt(51 * LAMPORTS_PER_SOL), // Amount of SOL spent on the initial token purchase (here it's 51 SOL, converted to lamports).
      SLIPPAGE_BASIS_POINTS, // Slippage tolerance for the transaction (in basis points).
      { // Compute unit limit and price for the transaction, used to optimize transaction fees and execution.
        unitLimit: 250_000, // Maximum number of compute units this transaction is allowed to consume.
        unitPrice: 250_000, // Price per compute unit (in micro-lamports).
      }
    );

    // Check if the `createAndBuy` operation was successful.
    if (createResults.success) {
      // If successful, print a success message including a link to the token's page on pump.fun.
      console.log("Success:", `https://pump.fun/${mint.publicKey.toBase58()}`);
      // Get the bonding curve account information again; it should now be available for the newly created account.
      boundingCurveAccount = await sdk.getBondingCurveAccount(mint.publicKey);
      // Print the bonding curve account information after the create and buy operation.
      console.log("Bonding curve after create and buy", boundingCurveAccount);
      // Call the `printSPLBalance` function to print the balance of the new token held by `testAccount`.
      printSPLBalance(connection, mint.publicKey, testAccount.publicKey);
    }
  } else { // If `boundingCurveAccount` already exists, it means the token was previously created.
    // Print the existing bonding curve account information.
    console.log("boundingCurveAccount", boundingCurveAccount);
    // Print a message indicating the token already exists, and provide the pump.fun link.
    console.log("Success:", `https://pump.fun/${mint.publicKey.toBase58()}`);
    // Print the balance of this token held by `testAccount`.
    printSPLBalance(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
  }

  // Ensure `boundingCurveAccount` exists (either newly created or previously existing) before executing subsequent buy/sell operations.
  if (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
    // This demonstrates a buy operation: buying 1 SOL worth of tokens.
    //buy 0.0001 SOL worth of tokens (Comment doesn't match code, it's actually 1 SOL)
    let buyResults = await sdk.buy(
      testAccount, // Keypair of the account used to pay SOL and receive tokens.
      mint.publicKey, // Public key of the mint address of the token to buy.
      BigInt(1 * LAMPORTS_PER_SOL), // Amount of SOL to use for buying tokens (here it's 1 SOL, converted to lamports).
      SLIPPAGE_BASIS_POINTS, // Slippage tolerance for the transaction.
      { // Compute unit limit and price for the transaction.
        unitLimit: 250000,
        unitPrice: 250000,
      }
    );

    // Check if the buy operation was successful.
    if (buyResults.success) {
      // If successful, print the latest token balance of `testAccount`.
      printSPLBalance(connection, mint.publicKey, testAccount.publicKey);
      // Print the bonding curve account information after the buy operation.
      console.log("Bonding curve after buy", await sdk.getBondingCurveAccount(mint.publicKey));
    } else { // If the buy operation failed.
      // Print a message indicating the buy operation failed.
      console.log("Buy failed");
    }
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    // This demonstrates a sell operation: first get the current token balance of the account, then sell all of them.
    //sell all tokens
    let currentSPLBalance = await getSPLBalance(
      connection, // Solana connection instance.
      mint.publicKey, // Public key of the token's mint address.
      testAccount.publicKey // Public key of the account holding the tokens.
    );
    // Print the currently retrieved SPL token balance.
    console.log("currentSPLBalance", currentSPLBalance);
    // Check if the current SPL token balance is greater than 0 (i.e., if there are tokens to sell).
    if (currentSPLBalance) {
      // Call the SDK's `sell` method to sell tokens.
      let sellResults = await sdk.sell(
        testAccount, // Keypair of the account to receive SOL and pay tokens.
        mint.publicKey, // Public key of the mint address of the token to sell.
        BigInt(currentSPLBalance * Math.pow(10, DEFAULT_DECIMALS)), // Number of tokens to sell. Here, the balance is multiplied by 10 to the power of `DEFAULT_DECIMALS` to convert to the smallest unit of the token.
        SLIPPAGE_BASIS_POINTS, // Slippage tolerance for the transaction.
        { // Compute unit limit and price for the transaction.
          unitLimit: 250000,
          unitPrice: 250000,
        }
      );
      // Check if the sell operation was successful.
      if (sellResults.success) {
        // If successful, print the latest SOL balance of `testAccount`.
        await printSOLBalance(
          connection,
          testAccount.publicKey,
          "Test Account keypair"
        );

        // Print the latest token balance of `testAccount` (should be 0 or close to 0 at this point), with the description "After SPL sell all".
        printSPLBalance(connection, mint.publicKey, testAccount.publicKey, "After SPL sell all");
        // Print the bonding curve account information after the sell operation.
        console.log("Bonding curve after sell", await sdk.getBondingCurveAccount(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀));
      } else { // If the sell operation failed.
        // Print a message indicating the sell operation failed.
        console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
      }
    }
  }
};

// Call the `main` function to start script execution.
main();
