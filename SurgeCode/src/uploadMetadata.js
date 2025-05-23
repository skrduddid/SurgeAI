"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMetadata = uploadMetadata;
const aws_sdk_1 = require("aws-sdk");
const fs = __importStar(require("fs"));
const s3 = new aws_sdk_1.S3({
    apiVersion: '2006-03-01',
    accessKeyId: 'C97BA604206F716F8AE2',
    secretAccessKey: '20VaJV4mmhQ6RNva2IenRDQmdebDYNbcGWmuIGnw',
    endpoint: 'https:
    region: 'us-east-1',
    s3ForcePathStyle: true,
});
const Bucket = 'pumpfun-metadata';
async function uploadFile(filePath, key) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const params = {
            Bucket: Bucket,
            Key: key,
            ContentType: 'image/png',
            Body: fileContent,
            ACL: 'public-read',
            Metadata: {
                cid: 'true',
            },
        };
        const request = s3.putObject(params);
        const uploadPromise = new Promise((resolve, reject) => {
            request.send((err, data) => {
                if (err) {
                    console.error('Error uploading file: ', err);
                    reject(err);
                }
                else {
                    console.log('File uploaded successfully.');
                    resolve();
                }
            });
        });
        let cid;
        request.on('httpHeaders', (statusCode, headers) => {
            cid = headers['x-amz-meta-cid'];
            console.log(`CID: ${cid}`);
        });
        await uploadPromise;
        return cid;
    }
    catch (err) {
        console.error('Error in uploadFile function: ', err);
        throw err;
    }
}
async function uploadJson(jsonData, key) {
    try {
        const body = JSON.stringify(jsonData);
        const params = {
            Bucket: Bucket,
            Key: key,
            ContentType: 'application/json',
            Body: body,
            ACL: 'public-read',
            Metadata: {
                cid: 'true',
            },
        };
        const request = s3.putObject(params);
        const uploadPromise = new Promise((resolve, reject) => {
            request.send((err, data) => {
                if (err) {
                    console.error('Error uploading JSON metadata:', err);
                    reject(err);
                }
                else {
                    console.log('JSON metadata uploaded successfully.');
                    resolve();
                }
            });
        });
        let cid;
        request.on('httpHeaders', (statusCode, headers) => {
            cid = headers['x-amz-meta-cid'];
            console.log(`Json CID: ${cid}`);
        });
        await uploadPromise;
        return cid;
    }
    catch (err) {
        console.error('Error in uploadJson function: ', err);
        throw err;
    }
}
async function uploadMetadata(create, mint) {
    try {
        const fileCID = await uploadFile(create.file, mint.publicKey.toString() + '.png');
        const JSONCID = await uploadJson({
            name: create.name,
            symbol: create.symbol,
            description: create.description,
            image: 'https://ipfs.io/ipfs/' + fileCID,
            twitter: create.twitter,
            telegram: create.telegram,
            website: create.website
        }, mint.publicKey.toString() + '.json');
        return 'https://ipfs.io/ipfs/' + JSONCID;
    }
    catch (err) {
        console.error("Metadata upload error:", err);
        throw err;
    }
}
