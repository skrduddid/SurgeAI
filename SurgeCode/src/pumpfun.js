"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpFunSDK = exports.DEFAULT_DECIMALS = exports.METADATA_SEED = exports.BONDING_CURVE_SEED = exports.MINT_AUTHORITY_SEED = exports.GLOBAL_ACCOUNT_SEED = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const globalAccount_1 = require("./globalAccount");
const events_1 = require("./events");
const bondingCurveAccount_1 = require("./bondingCurveAccount");
const util_1 = require("./util");
const IDL_1 = require("./IDL");
const uploadMetadata_1 = require("./uploadMetadata");
const sdk_1 = require("./new_idl/sdk");
const MPL_TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
exports.GLOBAL_ACCOUNT_SEED = "global";
exports.MINT_AUTHORITY_SEED = "mint-authority";
exports.BONDING_CURVE_SEED = "bonding-curve";
exports.METADATA_SEED = "metadata";
exports.DEFAULT_DECIMALS = 6;
class PumpFunSDK {
    constructor(provider) {
        this.provider = provider;
        this.connection = provider ? provider.connection : new web3_js_1.Connection("https://api.devnet.solana.com");
        this.pumpSdk = new sdk_1.PumpSdk(this.connection);
        try {
            if (provider) {
                this.program = new anchor_1.Program(IDL_1.IDL, provider, undefined, undefined);
            }
        }
        catch (e) {
            console.warn("Failed to initialize Anchor program. Some functionalities might be affected.");
        }
    }
    async createAndBuy(creator, mint, createTokenMetadata, buyAmountSol, slippageBasisPoints = 500n, priorityFees, commitment = util_1.DEFAULT_COMMITMENT, finality = util_1.DEFAULT_FINALITY) {
        let tokenMetadata = await (0, uploadMetadata_1.uploadMetadata)(createTokenMetadata, mint);
        const transaction = new web3_js_1.Transaction();
        const global = await this.pumpSdk.fetchGlobal();
        const createInstruction = await this.pumpSdk.createInstruction(mint.publicKey, createTokenMetadata.name, createTokenMetadata.symbol, tokenMetadata, creator.publicKey, creator.publicKey);
        transaction.add(createInstruction);
        if (buyAmountSol > 0) {
            const solAmountBN = new anchor_1.BN(buyAmountSol.toString());
            const tokenAmount = new anchor_1.BN(BigInt(buyAmountSol / 100n).toString());
            const bondingCurveAccountInfo = null;
            const newCoinCreator = creator.publicKey;
            const buyInstructions = await this.pumpSdk.buyInstructions(global, bondingCurveAccountInfo, {}, mint.publicKey, creator.publicKey, tokenAmount, solAmountBN, Number(slippageBasisPoints) / 10000, newCoinCreator);
            transaction.add(...buyInstructions);
        }
        let createResults = await (0, util_1.sendTx)(this.connection, transaction, creator.publicKey, [creator, mint], priorityFees, commitment, finality);
        return createResults;
    }
    async buy(buyer, mint, buyAmountSol, slippageBasisPoints = 500n, priorityFees, commitment = util_1.DEFAULT_COMMITMENT, finality = util_1.DEFAULT_FINALITY) {
        const global = await this.pumpSdk.fetchGlobal();
        const bondingCurveAddress = this.pumpSdk.bondingCurvePda(mint);
        const bondingCurveAccountInfo = await this.connection.getAccountInfo(bondingCurveAddress);
        if (!bondingCurveAccountInfo) {
            throw new Error(`Bonding curve account for mint ${mint.toBase58()} not found`);
        }
        const bondingCurve = this.pumpSdk.decodeBondingCurve(bondingCurveAccountInfo);
        const solAmountBN = new anchor_1.BN(buyAmountSol.toString());
        const tokenAmount = new anchor_1.BN(BigInt(buyAmountSol / 100n).toString());
        const buyInstructions = await this.pumpSdk.buyInstructions(global, bondingCurveAccountInfo, bondingCurve, mint, buyer.publicKey, tokenAmount, solAmountBN, Number(slippageBasisPoints) / 10000, bondingCurve.creator);
        const transaction = new web3_js_1.Transaction().add(...buyInstructions);
        return await (0, util_1.sendTx)(this.connection, transaction, buyer.publicKey, [buyer], priorityFees, commitment, finality);
    }
    async sell(seller, mint, sellTokenAmount, slippageBasisPoints = 500n, priorityFees, commitment = util_1.DEFAULT_COMMITMENT, finality = util_1.DEFAULT_FINALITY) {
        const global = await this.pumpSdk.fetchGlobal();
        const bondingCurveAddress = this.pumpSdk.bondingCurvePda(mint);
        const bondingCurveAccountInfo = await this.connection.getAccountInfo(bondingCurveAddress);
        if (!bondingCurveAccountInfo) {
            throw new Error(`Bonding curve account for mint ${mint.toBase58()} not found`);
        }
        const tokenAmountBN = new anchor_1.BN(sellTokenAmount.toString());
        const solAmount = new anchor_1.BN(BigInt(sellTokenAmount * 80n / 100n).toString());
        const sellInstructions = await this.pumpSdk.sellInstructions(global, bondingCurveAccountInfo, mint, seller.publicKey, tokenAmountBN, solAmount, Number(slippageBasisPoints) / 10000);
        const transaction = new web3_js_1.Transaction().add(...sellInstructions);
        return await (0, util_1.sendTx)(this.connection, transaction, seller.publicKey, [seller], priorityFees, commitment, finality);
    }
    async getBondingCurveAccount(mint, commitment = util_1.DEFAULT_COMMITMENT) {
        try {
            const bondingCurveData = await this.pumpSdk.fetchBondingCurve(mint);
            return new bondingCurveAccount_1.BondingCurveAccount(bondingCurveData);
        }
        catch (e) {
            return null;
        }
    }
    async getGlobalAccount(commitment = util_1.DEFAULT_COMMITMENT) {
        console.log("Fetching global account data...");
        try {
            const globalData = await this.pumpSdk.fetchGlobal();
            console.log("Raw global data:", globalData);
            const result = new globalAccount_1.GlobalAccount(globalData);
            console.log("Processed global account:", result);
            return result;
        }
        catch (error) {
            console.error("Error fetching global account:", error);
            throw error;
        }
    }
    //EVENTS
    addEventListener(eventType, callback) {
        if (!this.program) {
            console.warn('Program not initialized. Cannot add event listener. Event listener ID will be 0.');
            return 0;
        }
        return this.program.addEventListener(eventType, (event, slot, signature) => {
            let processedEvent;
            switch (eventType) {
                case "createEvent":
                    processedEvent = (0, events_1.toCreateEvent)(event);
                    callback(processedEvent, slot, signature);
                    break;
                case "tradeEvent":
                    processedEvent = (0, events_1.toTradeEvent)(event);
                    callback(processedEvent, slot, signature);
                    break;
                case "completeEvent":
                    processedEvent = (0, events_1.toCompleteEvent)(event);
                    callback(processedEvent, slot, signature);
                    console.log("completeEvent", event, slot, signature);
                    break;
                case "setParamsEvent":
                    processedEvent = (0, events_1.toSetParamsEvent)(event);
                    callback(processedEvent, slot, signature);
                    break;
                default:
                    console.error("Unhandled event type:", eventType);
            }
        });
    }
    removeEventListener(eventId) {
        if (!this.program) {
            console.warn('Program not initialized. Cannot remove event listener.');
            return;
        }
        this.program.removeEventListener(eventId);
    }
}
exports.PumpFunSDK = PumpFunSDK;
