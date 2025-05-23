"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpFunSDK = exports.DEFAULT_DECIMALS = exports.METADATA_SEED = exports.BONDING_CURVE_SEED = exports.MINT_AUTHORITY_SEED = exports.GLOBAL_ACCOUNT_SEED = void 0;
var web3_js_1 = require("@solana/web3.js");
var anchor_1 = require("@coral-xyz/anchor");
var globalAccount_1 = require("./globalAccount");
var events_1 = require("./events");
var bondingCurveAccount_1 = require("./bondingCurveAccount");
var util_1 = require("./util");
var IDL_1 = require("./IDL");
var uploadMetadata_1 = require("./uploadMetadata");
var sdk_1 = require("./new_idl/sdk");
var MPL_TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
exports.GLOBAL_ACCOUNT_SEED = "global";
exports.MINT_AUTHORITY_SEED = "mint-authority";
exports.BONDING_CURVE_SEED = "bonding-curve";
exports.METADATA_SEED = "metadata";
exports.DEFAULT_DECIMALS = 6;
// Adapter class, wrapping the new SDK to maintain the original interface
var PumpFunSDK = /** @class */ (function () {
    function PumpFunSDK(provider) {
        this.provider = provider;
        this.connection = provider ? provider.connection : new web3_js_1.Connection("https://api.devnet.solana.com");
        this.pumpSdk = new sdk_1.PumpSdk(this.connection);
        // Try to initialize program property to be compatible with old code
        try {
            if (provider) {
                this.program = new anchor_1.Program(IDL_1.IDL, provider, undefined, undefined);
            }
        }
        catch (e) {
            console.warn("Unable to initialize old Program instance");
        }
    }
    PumpFunSDK.prototype.createAndBuy = function (creator_1, mint_1, createTokenMetadata_1, buyAmountSol_1) {
        return __awaiter(this, arguments, void 0, function (creator, mint, createTokenMetadata, buyAmountSol, slippageBasisPoints, priorityFees, commitment, finality) {
            var tokenMetadata, transaction, global, createInstruction, solAmountBN, tokenAmount, bondingCurveAccountInfo, newCoinCreator, buyInstructions, createResults;
            if (slippageBasisPoints === void 0) { slippageBasisPoints = 500n; }
            if (commitment === void 0) { commitment = util_1.DEFAULT_COMMITMENT; }
            if (finality === void 0) { finality = util_1.DEFAULT_FINALITY; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, uploadMetadata_1.uploadMetadata)(createTokenMetadata, mint)];
                    case 1:
                        tokenMetadata = _a.sent();
                        transaction = new web3_js_1.Transaction();
                        return [4 /*yield*/, this.pumpSdk.fetchGlobal()];
                    case 2:
                        global = _a.sent();
                        return [4 /*yield*/, this.pumpSdk.createInstruction(mint.publicKey, createTokenMetadata.name, createTokenMetadata.symbol, tokenMetadata, creator.publicKey, creator.publicKey)];
                    case 3:
                        createInstruction = _a.sent();
                        transaction.add(createInstruction);
                        if (!(buyAmountSol > 0)) return [3 /*break*/, 5];
                        solAmountBN = new anchor_1.BN(buyAmountSol.toString());
                        tokenAmount = new anchor_1.BN(BigInt(buyAmountSol / 100n).toString());
                        bondingCurveAccountInfo = null;
                        newCoinCreator = creator.publicKey;
                        return [4 /*yield*/, this.pumpSdk.buyInstructions(global, bondingCurveAccountInfo, {}, mint.publicKey, creator.publicKey, tokenAmount, solAmountBN, Number(slippageBasisPoints) / 10000, newCoinCreator)];
                    case 4:
                        buyInstructions = _a.sent();
                        transaction.add.apply(transaction, buyInstructions);
                        _a.label = 5;
                    case 5: return [4 /*yield*/, (0, util_1.sendTx)(this.connection, transaction, creator.publicKey, [creator, mint], priorityFees, commitment, finality)];
                    case 6:
                        createResults = _a.sent();
                        return [2 /*return*/, createResults];
                }
            });
        });
    };
    PumpFunSDK.prototype.buy = function (buyer_1, mint_1, buyAmountSol_1) {
        return __awaiter(this, arguments, void 0, function (buyer, mint, buyAmountSol, slippageBasisPoints, priorityFees, commitment, finality) {
            var global, bondingCurveAddress, bondingCurveAccountInfo, bondingCurve, solAmountBN, tokenAmount, buyInstructions, transaction;
            var _a;
            if (slippageBasisPoints === void 0) { slippageBasisPoints = 500n; }
            if (commitment === void 0) { commitment = util_1.DEFAULT_COMMITMENT; }
            if (finality === void 0) { finality = util_1.DEFAULT_FINALITY; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.pumpSdk.fetchGlobal()];
                    case 1:
                        global = _b.sent();
                        bondingCurveAddress = this.pumpSdk.bondingCurvePda(mint);
                        return [4 /*yield*/, this.connection.getAccountInfo(bondingCurveAddress)];
                    case 2:
                        bondingCurveAccountInfo = _b.sent();
                        if (!bondingCurveAccountInfo) {
                            throw new Error("Bonding curve account for mint ".concat(mint.toBase58(), " not found"));
                        }
                        bondingCurve = this.pumpSdk.decodeBondingCurve(bondingCurveAccountInfo);
                        solAmountBN = new anchor_1.BN(buyAmountSol.toString());
                        tokenAmount = new anchor_1.BN(BigInt(buyAmountSol / 100n).toString());
                        return [4 /*yield*/, this.pumpSdk.buyInstructions(global, bondingCurveAccountInfo, bondingCurve, mint, buyer.publicKey, tokenAmount, solAmountBN, Number(slippageBasisPoints) / 10000, bondingCurve.creator)];
                    case 3:
                        buyInstructions = _b.sent();
                        transaction = (_a = new web3_js_1.Transaction()).add.apply(_a, buyInstructions);
                        return [4 /*yield*/, (0, util_1.sendTx)(this.connection, transaction, buyer.publicKey, [buyer], priorityFees, commitment, finality)];
                    case 4: 
                    // Send transaction
                    return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    PumpFunSDK.prototype.sell = function (seller_1, mint_1, sellTokenAmount_1) {
        return __awaiter(this, arguments, void 0, function (seller, mint, sellTokenAmount, slippageBasisPoints, priorityFees, commitment, finality) {
            var global, bondingCurveAddress, bondingCurveAccountInfo, tokenAmountBN, solAmount, sellInstructions, transaction;
            var _a;
            if (slippageBasisPoints === void 0) { slippageBasisPoints = 500n; }
            if (commitment === void 0) { commitment = util_1.DEFAULT_COMMITMENT; }
            if (finality === void 0) { finality = util_1.DEFAULT_FINALITY; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.pumpSdk.fetchGlobal()];
                    case 1:
                        global = _b.sent();
                        bondingCurveAddress = this.pumpSdk.bondingCurvePda(mint);
                        return [4 /*yield*/, this.connection.getAccountInfo(bondingCurveAddress)];
                    case 2:
                        bondingCurveAccountInfo = _b.sent();
                        if (!bondingCurveAccountInfo) {
                            throw new Error("Bonding curve account for mint ".concat(mint.toBase58(), " not found"));
                        }
                        tokenAmountBN = new anchor_1.BN(sellTokenAmount.toString());
                        solAmount = new anchor_1.BN(BigInt(sellTokenAmount * 80n / 100n).toString());
                        return [4 /*yield*/, this.pumpSdk.sellInstructions(global, bondingCurveAccountInfo, mint, seller.publicKey, tokenAmountBN, solAmount, Number(slippageBasisPoints) / 10000)];
                    case 3:
                        sellInstructions = _b.sent();
                        transaction = (_a = new web3_js_1.Transaction()).add.apply(_a, sellInstructions);
                        return [4 /*yield*/, (0, util_1.sendTx)(this.connection, transaction, seller.publicKey, [seller], priorityFees, commitment, finality)];
                    case 4: 
                    // Send transaction
                    return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    PumpFunSDK.prototype.getBondingCurveAccount = function (mint_1) {
        return __awaiter(this, arguments, void 0, function (mint, commitment) {
            var bondingCurveData, e_1;
            if (commitment === void 0) { commitment = util_1.DEFAULT_COMMITMENT; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pumpSdk.fetchBondingCurve(mint)];
                    case 1:
                        bondingCurveData = _a.sent();
                        // Convert to old structure
                        return [2 /*return*/, new bondingCurveAccount_1.BondingCurveAccount(bondingCurveData)];
                    case 2:
                        e_1 = _a.sent();
                        // If account doesn't exist, return null
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PumpFunSDK.prototype.getGlobalAccount = function () {
        return __awaiter(this, arguments, void 0, function (commitment) {
            var globalData, result, error_1;
            if (commitment === void 0) { commitment = util_1.DEFAULT_COMMITMENT; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Starting to fetch global account data...");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.pumpSdk.fetchGlobal()];
                    case 2:
                        globalData = _a.sent();
                        console.log("Fetched global account data:", globalData);
                        result = new globalAccount_1.GlobalAccount(globalData);
                        console.log("Converted result:", result);
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Failed to fetch global account:", error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    //EVENTS
    PumpFunSDK.prototype.addEventListener = function (eventType, callback) {
        if (!this.program) {
            console.warn('Event listener function unavailable, returned default event ID');
            return 0;
        }
        return this.program.addEventListener(eventType, function (event, slot, signature) {
            var processedEvent;
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
    };
    PumpFunSDK.prototype.removeEventListener = function (eventId) {
        if (!this.program) {
            console.warn('Event listener removal function unavailable');
            return;
        }
        this.program.removeEventListener(eventId);
    };
    return PumpFunSDK;
}());
exports.PumpFunSDK = PumpFunSDK;
