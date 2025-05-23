import {
  Commitment,
  Connection,
  Finality,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program, Provider } from "@coral-xyz/anchor";
import { GlobalAccount } from "./globalAccount";
import {
  CompleteEvent,
  CreateEvent,
  CreateTokenMetadata,
  PriorityFee,
  PumpFunEventHandlers,
  PumpFunEventType,
  SetParamsEvent,
  TradeEvent,
  TransactionResult,
} from "./types";
import {
  toCompleteEvent,
  toCreateEvent,
  toSetParamsEvent,
  toTradeEvent,
} from "./events";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { BondingCurveAccount } from "./bondingCurveAccount";
import {
  DEFAULT_COMMITMENT,
  DEFAULT_FINALITY,
  calculateWithSlippageBuy,
  calculateWithSlippageSell,
  sendTx,
} from "./util";
import { PumpFun, IDL } from "./IDL";
import { uploadMetadata } from "./uploadMetadata";
import {
  PUMP_PROGRAM_ID,
  PumpSdk,
} from "./new_idl/sdk";
import { bondingCurvePda, globalPda } from "./new_idl/pda";
import type { Global, BondingCurve } from "./new_idl/state";

const MPL_TOKEN_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

export const GLOBAL_ACCOUNT_SEED = "global";
export const MINT_AUTHORITY_SEED = "mint-authority";
export const BONDING_CURVE_SEED = "bonding-curve";
export const METADATA_SEED = "metadata";

export const DEFAULT_DECIMALS = 6;

export class PumpFunSDK {
  private pumpSdk: PumpSdk;
  public connection: Connection;
  private provider: Provider | undefined;
  private program: Program<PumpFun> | undefined;

  constructor(provider?: Provider) {
    this.provider = provider;
    this.connection = provider ? provider.connection : new Connection("https://api.devnet.solana.com");
    this.pumpSdk = new PumpSdk(this.connection);
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    try {
      if (provider) {
        this.program = new Program<PumpFun>(
          IDL as PumpFun, 
          provider,
          undefined,
          undefined
        );
      }
    } catch (e) {
      console.warn("Failed to initialize Anchor program. Some functionalities might be affected.");
    }
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀

  async createAndBuy(
    creator: Keypair,
    mint: Keypair,
    createTokenMetadata: CreateTokenMetadata,
    buyAmountSol: bigint,
    slippageBasisPoints: bigint = 500n,
    priorityFees?: PriorityFee,
    commitment: Commitment = DEFAULT_COMMITMENT,
    finality: Finality = DEFAULT_FINALITY
  ): Promise<TransactionResult> {
    let tokenMetadata = await uploadMetadata(createTokenMetadata, mint);

    const transaction = new Transaction();

    const global = await this.pumpSdk.fetchGlobal();

    const createInstruction = await this.pumpSdk.createInstruction(
      mint.publicKey,
      createTokenMetadata.name,
      createTokenMetadata.symbol,
      tokenMetadata,
      creator.publicKey,
      creator.publicKey
    );

    transaction.add(createInstruction);

    if (buyAmountSol > 0) {
      const solAmountBN = new BN(buyAmountSol.toString());

      const tokenAmount = new BN(BigInt(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀).toString());

      const bondingCurveAccountInfo = null;
      const newCoinCreator = creator.publicKey;

      const buyInstructions = await this.pumpSdk.buyInstructions(
        global, 
        bondingCurveAccountInfo, 
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
        mint.publicKey, 
        creator.publicKey, 
        tokenAmount, 
        solAmountBN, 
        Number(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) / 10000, 
        newCoinCreator
      );

      transaction.add(...buyInstructions);
    }

    let createResults = await sendTx(
      this.connection,
      transaction,
      creator.publicKey,
      [creator, mint],
      priorityFees,
      commitment,
      finality
    );

    return createResults;
  }

  async buy(
    buyer: Keypair,
    mint: PublicKey,
    buyAmountSol: bigint,
    slippageBasisPoints: bigint = 500n,
    priorityFees?: PriorityFee,
    commitment: Commitment = DEFAULT_COMMITMENT,
    finality: Finality = DEFAULT_FINALITY
  ): Promise<TransactionResult> {
    const global = await this.pumpSdk.fetchGlobal();

    const bondingCurveAddress = this.pumpSdk.bondingCurvePda(mint);
    const bondingCurveAccountInfo = await this.connection.getAccountInfo(bondingCurveAddress);

    if (!bondingCurveAccountInfo) {
      throw new Error(`Bonding curve account for mint ${mint.toBase58()} not found`);
    }

    const bondingCurve = this.pumpSdk.decodeBondingCurve(bondingCurveAccountInfo);

    const solAmountBN = new BN(buyAmountSol.toString());

    const tokenAmount = new BN(BigInt(buyAmountSol / 100n).toString());

    const buyInstructions = await this.pumpSdk.buyInstructions(
      global,
      bondingCurveAccountInfo,
      bondingCurve,
      mint,
      buyer.publicKey,
      tokenAmount,
      solAmountBN,
      Number(slippageBasisPoints) / 10000,
      bondingCurve.creator
    );

    const transaction = new Transaction().add(...buyInstructions);

    return await sendTx(
      this.connection,
      transaction,
      buyer.publicKey,
      [buyer],
      priorityFees,
      commitment,
      finality
    );
  }

  async sell(
    seller: Keypair,
    mint: PublicKey,
    sellTokenAmount: bigint,
    slippageBasisPoints: bigint = 500n,
    priorityFees?: PriorityFee,
    commitment: Commitment = DEFAULT_COMMITMENT,
    finality: Finality = DEFAULT_FINALITY
  ): Promise<TransactionResult> {
    const global = await this.pumpSdk.fetchGlobal();

    const bondingCurveAddress = this.pumpSdk.bondingCurvePda(mint);
    const bondingCurveAccountInfo = await this.connection.getAccountInfo(bondingCurveAddress);

    if (!bondingCurveAccountInfo) {
      throw new Error(`Bonding curve account for mint ${mint.toBase58()} not found`);
    }

    const tokenAmountBN = new BN(sellTokenAmount.toString());

    const solAmount = new BN(BigInt(sellTokenAmount * 80n / 100n).toString());

    const sellInstructions = await this.pumpSdk.sellInstructions(
      global,
      bondingCurveAccountInfo,
      mint,
      seller.publicKey,
      tokenAmountBN,
      solAmount,
      Number(slippageBasisPoints) / 10000
    );

    const transaction = new Transaction().add(...sellInstructions);

    return await sendTx(
      this.connection,
      transaction,
      seller.publicKey,
      [seller],
      priorityFees,
      commitment,
      finality
    );
  }

  async getBondingCurveAccount(
    mint: PublicKey,
    commitment: Commitment = DEFAULT_COMMITMENT
  ) {
    try {
      const bondingCurveData = await this.pumpSdk.fetchBondingCurve(mint);

      return new BondingCurveAccount(bondingCurveData);
    } catch (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    }
  }

  async getGlobalAccount(commitment: Commitment = DEFAULT_COMMITMENT) {
    console.log("Starting to fetch global account data...");
    try {
      const globalData = await this.pumpSdk.fetchGlobal();
      console.log("Fetched global account data:", globalData);

      const result = new GlobalAccount(globalData);
      console.log("Conversion result:", result);
      return result;
    } catch (error) {
      console.error("Failed to fetch global account:", error);
      throw error;
    }
  }

  //EVENTS
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    eventType: T,
    callback: (
      event: PumpFunEventHandlers[T],
      slot: number,
      signature: string
    ) => void
  ) {
    if (!this.program) {
      console.warn('Event listener unavailable, ID');
      return 0;
    }

    return this.program.addEventListener(
      eventType,
      (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) => {
        let processedEvent;
        switch (eventType) {
          case "createEvent":
            processedEvent = toCreateEvent(event as CreateEvent);
            callback(
              processedEvent as PumpFunEventHandlers[T],
              slot,
              signature
            );
            break;
          case "tradeEvent":
            processedEvent = toTradeEvent(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
            callback(
              processedEvent as PumpFunEventHandlers[T],
              slot,
              signature
            );
            break;
          case "completeEvent":
            processedEvent = toCompleteEvent(event as CompleteEvent);
            callback(
              processedEvent as PumpFunEventHandlers[T],
              slot,
              signature
            );
            console.log("completeEvent", event, slot, signature);
            break;
          case "setParamsEvent":
            processedEvent = toSetParamsEvent(event as SetParamsEvent);
            callback(
              processedEvent as PumpFunEventHandlers[T],
              slot,
              signature
            );
            break;
          default:
            console.error("Unhandled event type:", eventType);
        }
      }
    );
  }

  removeEventListener(eventId: number) {
    if (!this.program) {
      console.warn('Event listener removal function unavailable');
      return;
    }
    this.program.removeEventListener(eventId);
  }
}
