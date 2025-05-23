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
// Import necessary dependencies
var dotenv_1 = require("dotenv");
var fs_1 = require("fs");
var path_1 = require("path");
var express_1 = require("express");
var cors_1 = require("cors");
var multer_1 = require("multer");
var web3_js_1 = require("@solana/web3.js");
var src_1 = require("../../src");
var nodewallet_1 = require("@coral-xyz/anchor/dist/cjs/nodewallet");
var anchor_1 = require("@coral-xyz/anchor");
var axios_1 = require("axios");
// Load environment variables
dotenv_1.default.config();
// Setup Express application
var app = (0, express_1.default)();
var port = process.env.PORT || 3000;
// Configure detailed CORS options
var corsOptions = {
    origin: '*', // Allow all origins, should be restricted to specific domains in production
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight request results for 24 hours
};
// Apply middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Setup static file service
app.use(express_1.default.static(__dirname));
// Set up file upload directory
var upload = (0, multer_1.default)({ dest: path_1.default.join(__dirname, 'uploads') });
// Define key storage directory
var KEYS_FOLDER = __dirname + "/.keys";
// Define slippage tolerance in basis points (100 basis points = 1%)
var SLIPPAGE_BASIS_POINTS = 100n;
// Add this helper function at the top of the API for handling BigInt serialization
function replaceBigInt(key, value) {
    // Check if value is BigInt
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}
// Process image function - supports base64, URL and local paths
function processImage(imageInput) {
    return __awaiter(this, void 0, void 0, function () {
        var matches, extension, data, buffer, fileName, filePath, response, contentType, extension, fileName, filePath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check if input is base64
                    if (imageInput.startsWith('data:image')) {
                        matches = imageInput.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                        if (!matches || matches.length !== 3) {
                            throw new Error('Invalid base64 image format');
                        }
                        extension = matches[1];
                        data = matches[2];
                        buffer = Buffer.from(data, 'base64');
                        fileName = "image_".concat(Date.now(), ".").concat(extension);
                        filePath = path_1.default.join(__dirname, 'uploads', fileName);
                        // Ensure uploads directory exists
                        if (!fs_1.default.existsSync(path_1.default.join(__dirname, 'uploads'))) {
                            fs_1.default.mkdirSync(path_1.default.join(__dirname, 'uploads'), { recursive: true });
                        }
                        fs_1.default.writeFileSync(filePath, buffer);
                        return [2 /*return*/, filePath];
                    }
                    if (!(imageInput.startsWith('http://') || imageInput.startsWith('https://'))) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(imageInput, {
                            responseType: 'arraybuffer',
                            timeout: 10000 // 10 seconds timeout
                        })];
                case 2:
                    response = _a.sent();
                    contentType = response.headers['content-type'];
                    extension = contentType.split('/')[1] || 'jpg';
                    fileName = "image_".concat(Date.now(), ".").concat(extension);
                    filePath = path_1.default.join(__dirname, 'uploads', fileName);
                    // Ensure uploads directory exists
                    if (!fs_1.default.existsSync(path_1.default.join(__dirname, 'uploads'))) {
                        fs_1.default.mkdirSync(path_1.default.join(__dirname, 'uploads'), { recursive: true });
                    }
                    fs_1.default.writeFileSync(filePath, Buffer.from(response.data));
                    return [2 /*return*/, filePath];
                case 3:
                    error_1 = _a.sent();
                    throw new Error("Failed to download image from URL: ".concat(error_1.message));
                case 4:
                    // Assume it's a local path, check if file exists
                    if (fs_1.default.existsSync(imageInput)) {
                        return [2 /*return*/, imageInput];
                    }
                    throw new Error('Invalid image input: not a valid base64 string, URL, or file path');
            }
        });
    });
}
// Create or get wallet keypair
function getWalletFromKey(secretKeyString) {
    try {
        // Try to parse private key in base58 format
        try {
            // If the provided key is a base58 format private key string
            return web3_js_1.Keypair.fromSecretKey(Buffer.from(secretKeyString.split(',').map(Number)));
        }
        catch (e) {
            // If the previous method fails, try using bs58 parsing directly
            var bs58 = require('bs58');
            return web3_js_1.Keypair.fromSecretKey(bs58.decode(secretKeyString));
        }
    }
    catch (error) {
        // Try fallback to old base64 format parsing logic
        try {
            var secretKey = new Uint8Array(Buffer.from(secretKeyString, 'base64'));
            return web3_js_1.Keypair.fromSecretKey(secretKey);
        }
        catch (base64Error) {
            throw new Error("Invalid secret key format: ".concat(error.message, ". Please use a valid Solana private key in base58 format."));
        }
    }
}
// Home route - provide HTML interface
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
// API endpoint - create token
app.post('/api/create-token', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, symbol, description, twitter, telegram, website, file, KEY, buy, processedImagePath, connection, wallet, provider, sdk, mint, tokenMetadata, buyAmount, walletBalanceCheck, walletBalance, requiredBalance, balanceError_1, buyAmountLamports, createResults, boundingCurveAccount, boundingCurveError_1, processedBoundingCurveAccount, processedCreateResults, boundingCurveAccount2, boundingCurveError_2, processedCreateResults, processedBoundingCurveAccount, createError_1, boundingCurveAccount3, boundingCurveError_3, processedBoundingCurveAccount, errorDetails, error_2, errorResponse, error_3, errorResponse;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 27, , 28]);
                _a = req.body, name_1 = _a.name, symbol = _a.symbol, description = _a.description, twitter = _a.twitter, telegram = _a.telegram, website = _a.website, file = _a.file, KEY = _a.KEY, buy = _a.buy;
                console.log('Received create token request:', { name: name_1, symbol: symbol, description: description });
                // Validate required fields
                if (!name_1 || !symbol || !description || !file || !KEY || !buy) {
                    return [2 /*return*/, res.status(400).json({ success: false, error: 'Missing required fields' })];
                }
                // Validate HELIUS_RPC_URL environment variable
                if (!process.env.HELIUS_RPC_URL) {
                    return [2 /*return*/, res.status(500).json({
                            success: false,
                            error: 'Please set HELIUS_RPC_URL in .env file. Example: HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<your api key>'
                        })];
                }
                // Process image file
                console.log('Processing image file...');
                return [4 /*yield*/, processImage(file)];
            case 1:
                processedImagePath = _b.sent();
                console.log('Image processed:', processedImagePath);
                // Create Solana connection
                console.log('Connecting to Solana...');
                connection = new web3_js_1.Connection(process.env.HELIUS_RPC_URL);
                _b.label = 2;
            case 2:
                _b.trys.push([2, 25, , 26]);
                wallet = new nodewallet_1.default(getWalletFromKey(KEY));
                provider = new anchor_1.AnchorProvider(connection, wallet, {
                    commitment: "finalized",
                });
                sdk = new src_1.PumpFunSDK(provider);
                mint = web3_js_1.Keypair.generate();
                console.log('Generated token mint address:', mint.publicKey.toBase58());
                tokenMetadata = {
                    name: name_1,
                    symbol: symbol,
                    description: description,
                    twitter: twitter,
                    telegram: telegram,
                    website: website,
                    file: processedImagePath,
                };
                buyAmount = parseFloat(buy);
                if (isNaN(buyAmount) || buyAmount <= 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid buy amount'
                        })];
                }
                walletBalanceCheck = true;
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4 /*yield*/, connection.getBalance(wallet.publicKey)];
            case 4:
                walletBalance = _b.sent();
                requiredBalance = BigInt(Math.floor(buyAmount * web3_js_1.LAMPORTS_PER_SOL)) + BigInt(Math.floor(0.01 * web3_js_1.LAMPORTS_PER_SOL));
                if (walletBalance < Number(requiredBalance)) {
                    walletBalanceCheck = false;
                    console.warn("\u94B1\u5305\u4F59\u989D\u53EF\u80FD\u4E0D\u8DB3\u3002\u5F53\u524D\u4F59\u989D: ".concat(walletBalance / web3_js_1.LAMPORTS_PER_SOL, " SOL, \u9700\u8981: ").concat(Number(requiredBalance) / web3_js_1.LAMPORTS_PER_SOL, " SOL"));
                }
                return [3 /*break*/, 6];
            case 5:
                balanceError_1 = _b.sent();
                console.warn('Failed to get wallet balance:', balanceError_1.message);
                walletBalanceCheck = false;
                return [3 /*break*/, 6];
            case 6:
                console.log('Starting token creation...');
                _b.label = 7;
            case 7:
                _b.trys.push([7, 19, , 24]);
                buyAmountLamports = BigInt(Math.floor(buyAmount * web3_js_1.LAMPORTS_PER_SOL));
                console.log("\u8D2D\u4E70\u91D1\u989D: ".concat(buyAmount, " SOL (").concat(buyAmountLamports, " lamports)"));
                console.log("\u6ED1\u70B9\u5BB9\u5FCD\u5EA6: ".concat(SLIPPAGE_BASIS_POINTS, " \u57FA\u70B9 (").concat(Number(SLIPPAGE_BASIS_POINTS) / 100, "%)"));
                console.log("\u8BA1\u7B97\u5355\u5143\u8BBE\u7F6E: \u9650\u5236=".concat(400000, ", \u4EF7\u683C=").concat(400000));
                // Print token metadata
                console.log('Token metadata:', {
                    name: tokenMetadata.name,
                    symbol: tokenMetadata.symbol,
                    description: tokenMetadata.description,
                    imagePath: processedImagePath
                });
                // Print mint address
                console.log('Token mint address:', mint.publicKey.toBase58());
                return [4 /*yield*/, sdk.createAndBuy(wallet.payer, mint, tokenMetadata, 
                    // Use user-specified purchase amount directly
                    buyAmountLamports, SLIPPAGE_BASIS_POINTS, {
                        unitLimit: 400000, // Increase calculation unit limit, from 250_000 to 400_000
                        unitPrice: 400000, // Increase calculation unit price, from 250_000 to 400_000
                    })];
            case 8:
                createResults = _b.sent();
                // Record signature information for debugging
                if (createResults.signature) {
                    console.log("Transaction signature: ".concat(createResults.signature));
                    console.log("Transaction explorer link: https://solscan.io/tx/".concat(createResults.signature));
                }
                if (!createResults.success) return [3 /*break*/, 13];
                console.log('Token created successfully:', mint.publicKey.toBase58());
                boundingCurveAccount = null;
                _b.label = 9;
            case 9:
                _b.trys.push([9, 11, , 12]);
                return [4 /*yield*/, sdk.getBondingCurveAccount(mint.publicKey)];
            case 10:
                boundingCurveAccount = _b.sent();
                console.log('Got bonding curve account successfully:', JSON.stringify(boundingCurveAccount, replaceBigInt));
                return [3 /*break*/, 12];
            case 11:
                boundingCurveError_1 = _b.sent();
                console.warn('Failed to get bonding curve account:', boundingCurveError_1.message);
                return [3 /*break*/, 12];
            case 12:
                processedBoundingCurveAccount = boundingCurveAccount ?
                    JSON.parse(JSON.stringify(boundingCurveAccount, replaceBigInt)) : null;
                processedCreateResults = JSON.parse(JSON.stringify(createResults, replaceBigInt));
                // Return success result
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        tokenAddress: mint.publicKey.toBase58(),
                        tokenUrl: "https://pump.fun/".concat(mint.publicKey.toBase58()),
                        walletBalanceVerified: walletBalanceCheck,
                        boundingCurveAccount: processedBoundingCurveAccount,
                        transaction: processedCreateResults,
                        message: "\u4EE3\u5E01\u521B\u5EFA\u548C\u8D2D\u4E70\u6210\u529F\uFF0C\u8D2D\u4E70\u91D1\u989D ".concat(buyAmount, " SOL")
                    })];
            case 13:
                console.error('Token creation failed:', createResults);
                boundingCurveAccount2 = null;
                _b.label = 14;
            case 14:
                _b.trys.push([14, 16, , 17]);
                return [4 /*yield*/, sdk.getBondingCurveAccount(mint.publicKey)];
            case 15:
                boundingCurveAccount2 = _b.sent();
                if (boundingCurveAccount2) {
                    console.log('Token might have been created but purchase failed:', mint.publicKey.toBase58());
                }
                return [3 /*break*/, 17];
            case 16:
                boundingCurveError_2 = _b.sent();
                console.warn('Failed to check token creation status:', boundingCurveError_2.message);
                return [3 /*break*/, 17];
            case 17:
                processedCreateResults = JSON.parse(JSON.stringify(createResults, replaceBigInt));
                processedBoundingCurveAccount = boundingCurveAccount2 ?
                    JSON.parse(JSON.stringify(boundingCurveAccount2, replaceBigInt)) : null;
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: 'Failed to create token or complete initial purchase',
                        tokenAddress: mint.publicKey.toBase58(),
                        tokenExistsOnChain: boundingCurveAccount2 !== null,
                        tokenUrl: "https://pump.fun/".concat(mint.publicKey.toBase58()),
                        boundingCurveAccount: processedBoundingCurveAccount,
                        transaction: processedCreateResults,
                        walletBalanceVerified: walletBalanceCheck
                    })];
            case 18: return [3 /*break*/, 24];
            case 19:
                createError_1 = _b.sent();
                console.error('Token creation transaction failed:', createError_1);
                boundingCurveAccount3 = null;
                _b.label = 20;
            case 20:
                _b.trys.push([20, 22, , 23]);
                return [4 /*yield*/, sdk.getBondingCurveAccount(mint.publicKey)];
            case 21:
                boundingCurveAccount3 = _b.sent();
                if (boundingCurveAccount3) {
                    console.log('Token might have been created but transaction processing failed:', mint.publicKey.toBase58());
                }
                return [3 /*break*/, 23];
            case 22:
                boundingCurveError_3 = _b.sent();
                console.warn('Failed to check token creation status:', boundingCurveError_3.message);
                return [3 /*break*/, 23];
            case 23:
                processedBoundingCurveAccount = boundingCurveAccount3 ?
                    JSON.parse(JSON.stringify(boundingCurveAccount3, replaceBigInt)) : null;
                errorDetails = {};
                try {
                    if (createError_1.logs) {
                        errorDetails.logs = createError_1.logs;
                    }
                    if (createError_1.data) {
                        errorDetails.data = JSON.parse(JSON.stringify(createError_1.data, replaceBigInt));
                    }
                }
                catch (e) {
                    console.error('Error serializing error details:', e);
                }
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: "\u4EE3\u5E01\u521B\u5EFA\u4EA4\u6613\u5931\u8D25: ".concat(createError_1.message),
                        tokenAddress: mint.publicKey.toBase58(),
                        tokenExistsOnChain: boundingCurveAccount3 !== null,
                        tokenUrl: "https://pump.fun/".concat(mint.publicKey.toBase58()),
                        walletBalanceVerified: walletBalanceCheck,
                        boundingCurveAccount: processedBoundingCurveAccount,
                        errorDetails: errorDetails
                    })];
            case 24: return [3 /*break*/, 26];
            case 25:
                error_2 = _b.sent();
                console.error('Wallet or transaction error:', error_2);
                errorResponse = {
                    success: false,
                    error: "Wallet or transaction error: ".concat(error_2.message)
                };
                // If error object has data field, also process it
                if (error_2.data) {
                    try {
                        errorResponse['data'] = JSON.parse(JSON.stringify(error_2.data, replaceBigInt));
                    }
                    catch (e) {
                        console.error('Error serializing error data:', e);
                    }
                }
                return [2 /*return*/, res.status(500).json(errorResponse)];
            case 26: return [3 /*break*/, 28];
            case 27:
                error_3 = _b.sent();
                console.error('Error creating token:', error_3);
                errorResponse = {
                    success: false,
                    error: error_3.message || 'An unknown error occurred'
                };
                // If error object has data field, also process it
                if (error_3.data) {
                    try {
                        errorResponse['data'] = JSON.parse(JSON.stringify(error_3.data, replaceBigInt));
                    }
                    catch (e) {
                        console.error('Error serializing error data:', e);
                    }
                }
                return [2 /*return*/, res.status(500).json(errorResponse)];
            case 28: return [2 /*return*/];
        }
    });
}); });
// Health check endpoint
app.get('/health', function (req, res) {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling middleware - ensure BigInts in all error objects are correctly serialized
app.use(function (err, req, res, next) {
    console.error('Server error:', err);
    // Ensure BigInts in error object are correctly serialized
    var errorObj = {
        success: false,
        error: err.message || 'Internal Server Error'
    };
    // If error object contains other fields, also process BigInts
    if (err.data) {
        try {
            errorObj.data = JSON.parse(JSON.stringify(err.data, replaceBigInt));
        }
        catch (e) {
            console.error('Error serializing error data:', e);
            errorObj.data = { error: 'Error serializing data' };
        }
    }
    // Try to process entire errorObj object for possible BigInts
    try {
        res.status(500).json(errorObj);
    }
    catch (error) {
        console.error('Error sending error response:', error);
        // Last fallback option, send pure text error
        res.status(500).send('Internal Server Error: Failed to serialize error response');
    }
});
// Modify Express.js response method to handle BigInts
var originalJson = express_1.default.response.json;
express_1.default.response.json = function (body) {
    try {
        return originalJson.call(this, JSON.parse(JSON.stringify(body, replaceBigInt)));
    }
    catch (error) {
        console.error('Error in response.json override:', error);
        return originalJson.call(this, { error: 'Error serializing response' });
    }
};
// Start server
app.listen(port, function () {
    console.log("API server running at http://localhost:".concat(port));
    console.log("\u8BBF\u95EE http://localhost:".concat(port, " \u6253\u5F00\u7F51\u9875\u754C\u9762"));
});
