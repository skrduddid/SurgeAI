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
exports.uploadMetadata = uploadMetadata;
var aws_sdk_1 = require("aws-sdk");
var fs = require("fs");
// Configure S3 client
var s3 = new aws_sdk_1.S3({
    apiVersion: '2006-03-01',
    accessKeyId: 'C97BA604206F716F8AE2',
    secretAccessKey: '20VaJV4mmhQ6RNva2IenRDQmdebDYNbcGWmuIGnw',
    endpoint: 'https://s3.filebase.com', // Ensure endpoint is plain text URL
    region: 'us-east-1',
    s3ForcePathStyle: true,
});
var Bucket = 'pumpfun-metadata';
function uploadFile(filePath, key) {
    return __awaiter(this, void 0, void 0, function () {
        var fileContent, params, request_1, uploadPromise, cid_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    fileContent = fs.readFileSync(filePath);
                    params = {
                        Bucket: Bucket,
                        Key: key,
                        ContentType: 'image/png',
                        Body: fileContent,
                        ACL: 'public-read',
                        Metadata: {
                            cid: 'true', // Request Filebase to return CID
                        },
                    };
                    request_1 = s3.putObject(params);
                    uploadPromise = new Promise(function (resolve, reject) {
                        request_1.send(function (err, data) {
                            if (err) {
                                console.error('Upload failed:', err);
                                reject(err);
                            }
                            else {
                                console.log('Upload successful');
                                resolve();
                            }
                        });
                    });
                    request_1.on('httpHeaders', function (statusCode, headers) {
                        cid_1 = headers['x-amz-meta-cid'];
                        console.log("Image CID: ".concat(cid_1));
                    });
                    // Wait for upload to complete and return CID
                    return [4 /*yield*/, uploadPromise];
                case 1:
                    // Wait for upload to complete and return CID
                    _a.sent();
                    return [2 /*return*/, cid_1];
                case 2:
                    err_1 = _a.sent();
                    console.error('Image upload failed:', err_1);
                    throw err_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function uploadJson(jsonData, key) {
    return __awaiter(this, void 0, void 0, function () {
        var body, params, request_2, uploadPromise, cid_2, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    body = JSON.stringify(jsonData);
                    params = {
                        Bucket: Bucket,
                        Key: key,
                        ContentType: 'application/json',
                        Body: body,
                        ACL: 'public-read',
                        Metadata: {
                            cid: 'true', // Request Filebase to return CID
                        },
                    };
                    request_2 = s3.putObject(params);
                    uploadPromise = new Promise(function (resolve, reject) {
                        request_2.send(function (err, data) {
                            if (err) {
                                console.error('Json upload failed:', err);
                                reject(err);
                            }
                            else {
                                console.log('Json upload successful');
                                resolve();
                            }
                        });
                    });
                    request_2.on('httpHeaders', function (statusCode, headers) {
                        cid_2 = headers['x-amz-meta-cid'];
                        console.log("Json CID: ".concat(cid_2));
                    });
                    // Wait for upload to complete and return CID
                    return [4 /*yield*/, uploadPromise];
                case 1:
                    // Wait for upload to complete and return CID
                    _a.sent();
                    return [2 /*return*/, cid_2];
                case 2:
                    err_2 = _a.sent();
                    console.error('Upload failed:', err_2);
                    throw err_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Use example
function uploadMetadata(create, mint) {
    return __awaiter(this, void 0, void 0, function () {
        var fileCID, JSONCID, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, uploadFile(create.file, mint.publicKey.toString() + '.png')];
                case 1:
                    fileCID = _a.sent();
                    return [4 /*yield*/, uploadJson({
                            name: create.name,
                            symbol: create.symbol,
                            description: create.description,
                            image: 'https://ipfs.io/ipfs/' + fileCID,
                            twitter: create.twitter,
                            telegram: create.telegram,
                            website: create.website
                        }, mint.publicKey.toString() + '.json')];
                case 2:
                    JSONCID = _a.sent();
                    return [2 /*return*/, 'https://ipfs.io/ipfs/' + JSONCID];
                case 3:
                    err_3 = _a.sent();
                    console.error("Error:", err_3);
                    throw err_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
