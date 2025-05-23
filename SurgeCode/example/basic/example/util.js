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
exports.valueToBase = exports.baseToValue = exports.printSPLBalance = exports.getSPLBalance = exports.printSOLBalance = void 0;
exports.getOrCreateKeypair = getOrCreateKeypair;
exports.getDiscriminator = getDiscriminator;
var bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var js_sha256_1 = require("js-sha256");
var fs_1 = require("fs");
function getOrCreateKeypair(dir, keyName) {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    var authorityKey = dir + "/" + keyName + ".json";
    if (fs_1.default.existsSync(authorityKey)) {
        try {
            // Try to read array format key
            return web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs_1.default.readFileSync(authorityKey, "utf-8"))));
        }
        catch (e) {
            try {
                // Try to read bs58 format key
                var data = JSON.parse(fs_1.default.readFileSync(authorityKey, "utf-8"));
                return web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(data.secretKey));
            }
            catch (e2) {
                // Failed, create new key
                console.log("Unable to read key file, generating new key");
                var keypair = web3_js_1.Keypair.generate();
                fs_1.default.writeFileSync(authorityKey, JSON.stringify(Array.from(keypair.secretKey)));
                return keypair;
            }
        }
    }
    else {
        var keypair = web3_js_1.Keypair.generate();
        fs_1.default.writeFileSync(authorityKey, JSON.stringify(Array.from(keypair.secretKey)));
        return keypair;
    }
}
var printSOLBalance = function (connection_1, pubKey_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([connection_1, pubKey_1], args_1, true), void 0, function (connection, pubKey, info) {
        var balance;
        if (info === void 0) { info = ""; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getBalance(pubKey)];
                case 1:
                    balance = _a.sent();
                    console.log("".concat(info ? info + " " : "").concat(pubKey.toBase58(), ":"), balance / web3_js_1.LAMPORTS_PER_SOL, "SOL");
                    return [2 /*return*/];
            }
        });
    });
};
exports.printSOLBalance = printSOLBalance;
var getSPLBalance = function (connection_1, mintAddress_1, pubKey_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([connection_1, mintAddress_1, pubKey_1], args_1, true), void 0, function (connection, mintAddress, pubKey, allowOffCurve) {
        var ata, balance, e_1;
        if (allowOffCurve === void 0) { allowOffCurve = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    ata = (0, spl_token_1.getAssociatedTokenAddressSync)(mintAddress, pubKey, allowOffCurve);
                    return [4 /*yield*/, connection.getTokenAccountBalance(ata, "processed")];
                case 1:
                    balance = _a.sent();
                    return [2 /*return*/, balance.value.uiAmount];
                case 2:
                    e_1 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, null];
            }
        });
    });
};
exports.getSPLBalance = getSPLBalance;
var printSPLBalance = function (connection_1, mintAddress_1, user_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([connection_1, mintAddress_1, user_1], args_1, true), void 0, function (connection, mintAddress, user, info) {
        var balance;
        if (info === void 0) { info = ""; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.getSPLBalance)(connection, mintAddress, user)];
                case 1:
                    balance = _a.sent();
                    if (balance === null) {
                        console.log("".concat(info ? info + " " : "").concat(user.toBase58(), ":"), "No Account Found");
                    }
                    else {
                        console.log("".concat(info ? info + " " : "").concat(user.toBase58(), ":"), balance);
                    }
                    return [2 /*return*/];
            }
        });
    });
};
exports.printSPLBalance = printSPLBalance;
var baseToValue = function (base, decimals) {
    return base * Math.pow(10, decimals);
};
exports.baseToValue = baseToValue;
var valueToBase = function (value, decimals) {
    return value / Math.pow(10, decimals);
};
exports.valueToBase = valueToBase;
//i.e. account:BondingCurve
function getDiscriminator(name) {
    return js_sha256_1.sha256.digest(name).slice(0, 8);
}
