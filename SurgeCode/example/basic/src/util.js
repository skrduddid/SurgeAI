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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTxDetails = exports.buildVersionedTx = exports.calculateWithSlippageSell = exports.calculateWithSlippageBuy = exports.DEFAULT_FINALITY = exports.DEFAULT_COMMITMENT = void 0;
exports.sendTx = sendTx;
var web3_js_1 = require("@solana/web3.js");
exports.DEFAULT_COMMITMENT = "finalized";
exports.DEFAULT_FINALITY = "finalized";
var calculateWithSlippageBuy = function (amount, basisPoints) {
    return amount + (amount * basisPoints) / 10000n;
};
exports.calculateWithSlippageBuy = calculateWithSlippageBuy;
var calculateWithSlippageSell = function (amount, basisPoints) {
    return amount - (amount * basisPoints) / 10000n;
};
exports.calculateWithSlippageSell = calculateWithSlippageSell;
function sendTx(connection_1, tx_1, payer_1, signers_1, priorityFees_1) {
    return __awaiter(this, arguments, void 0, function (connection, tx, payer, signers, priorityFees, commitment, finality) {
        var newTx, modifyComputeUnits, addPriorityFee, versionedTx, sig, txResult, e_1, ste, _a, _b, _c;
        if (commitment === void 0) { commitment = exports.DEFAULT_COMMITMENT; }
        if (finality === void 0) { finality = exports.DEFAULT_FINALITY; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    newTx = new web3_js_1.Transaction();
                    if (priorityFees) {
                        modifyComputeUnits = web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                            units: priorityFees.unitLimit,
                        });
                        addPriorityFee = web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({
                            microLamports: priorityFees.unitPrice,
                        });
                        newTx.add(modifyComputeUnits);
                        newTx.add(addPriorityFee);
                    }
                    newTx.add(tx);
                    return [4 /*yield*/, (0, exports.buildVersionedTx)(connection, payer, newTx, commitment)];
                case 1:
                    versionedTx = _d.sent();
                    versionedTx.sign(signers);
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 5, , 9]);
                    return [4 /*yield*/, connection.sendTransaction(versionedTx, {
                            skipPreflight: false,
                        })];
                case 3:
                    sig = _d.sent();
                    console.log("sig:", "https://solscan.io/tx/".concat(sig));
                    return [4 /*yield*/, (0, exports.getTxDetails)(connection, sig, commitment, finality)];
                case 4:
                    txResult = _d.sent();
                    if (!txResult) {
                        return [2 /*return*/, {
                                success: false,
                                error: "Transaction failed",
                            }];
                    }
                    return [2 /*return*/, {
                            success: true,
                            signature: sig,
                            results: txResult,
                        }];
                case 5:
                    e_1 = _d.sent();
                    if (!(e_1 instanceof web3_js_1.SendTransactionError)) return [3 /*break*/, 7];
                    ste = e_1;
                    _b = (_a = console).log;
                    _c = "SendTransactionError";
                    return [4 /*yield*/, ste.getLogs(connection)];
                case 6:
                    _b.apply(_a, [_c + (_d.sent())]);
                    return [3 /*break*/, 8];
                case 7:
                    console.error(e_1);
                    _d.label = 8;
                case 8: return [2 /*return*/, {
                        error: e_1,
                        success: false,
                    }];
                case 9: return [2 /*return*/];
            }
        });
    });
}
var buildVersionedTx = function (connection_1, payer_1, tx_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([connection_1, payer_1, tx_1], args_1, true), void 0, function (connection, payer, tx, commitment) {
        var blockHash, messageV0;
        if (commitment === void 0) { commitment = exports.DEFAULT_COMMITMENT; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getLatestBlockhash(commitment)];
                case 1:
                    blockHash = (_a.sent())
                        .blockhash;
                    messageV0 = new web3_js_1.TransactionMessage({
                        payerKey: payer,
                        recentBlockhash: blockHash,
                        instructions: tx.instructions,
                    }).compileToV0Message();
                    return [2 /*return*/, new web3_js_1.VersionedTransaction(messageV0)];
            }
        });
    });
};
exports.buildVersionedTx = buildVersionedTx;
var getTxDetails = function (connection_1, sig_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([connection_1, sig_1], args_1, true), void 0, function (connection, sig, commitment, finality) {
        var latestBlockHash;
        if (commitment === void 0) { commitment = exports.DEFAULT_COMMITMENT; }
        if (finality === void 0) { finality = exports.DEFAULT_FINALITY; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getLatestBlockhash()];
                case 1:
                    latestBlockHash = _a.sent();
                    return [4 /*yield*/, connection.confirmTransaction({
                            blockhash: latestBlockHash.blockhash,
                            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                            signature: sig,
                        }, commitment)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, connection.getTransaction(sig, {
                            maxSupportedTransactionVersion: 0,
                            commitment: finality,
                        })];
            }
        });
    });
};
exports.getTxDetails = getTxDetails;
