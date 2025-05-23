import { AWSError, S3 } from 'aws-sdk';
import * as fs from 'fs';
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
import { Keypair } from "@solana/web3.js";
import { blob } from 'aws-sdk/clients/codecommit';
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
const s3 = new S3({
    apiVersion: '2006-03-01',
    accessKeyId: '',
    secretAccessKey: '',
    endpoint: '',
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    s3ForcePathStyle: true,
});

const Bucket = 'pumpfun-metadata';

async function uploadFile(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀): Promise<string | undefined> {
    try {
        const fileContent = fs.readFileSync(filePath) as Buffer;

        const params: S3.PutObjectRequest = {
            Bucket: Bucket,
            Key: key,
            ContentType: 'image/png',
            Body: fileContent,
            ACL: 'public-read',
            Metadata: {
                cid: 'true',
            },
        };

⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀

        const uploadPromise = new Promise<void>((resolve, reject) => {
            request.send((err: AWSError | null, data: S3.PutObjectOutput) => {
                if (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
                    console.error('Error uploading file: ', err);
                    reject(err);
                } else {
                    console.log('File uploaded successfully.');
                    resolve();
                }
            });
        });

        let cid: string | undefined;
        request.on('httpHeaders', (statusCode: number, headers: Record<string, string>) => {
            cid = headers['x-amz-meta-cid'];
            console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
        });

        await uploadPromise;
        return cid;
    } catch (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
        console.error('Error in uploadFile function: ', err);
        throw err;
    }
}

async function uploadJson(jsonData: object, key: string): Promise<string | undefined> {
    try {
        const body = JSON.stringify(jsonData);

        const params: S3.PutObjectRequest = {
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

        const uploadPromise = new Promise<void>((resolve, reject) => {
            request.send((err: AWSError | null, data: S3.PutObjectOutput) => {
                if (err) {
                    console.error('Error uploading JSON metadata:', err);
                    reject(err);
                } else {
                    console.log('JSON metadata uploaded successfully.');
                    resolve();
                }
            });
        });

        let cid: string | undefined;
        request.on('httpHeaders', (statusCode: number, headers: Record<string, string>) => {
            cid = headers['x-amz-meta-cid'];
            console.log(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
        });

        await uploadPromise;
        return cid;
    } catch (err) {
        console.error('Error in uploadJson function: ', err);
        throw err;
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
}

export async function uploadMetadata(create: CreateTokenMetadata, mint: Keypair): Promise<string | string> {
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
        }, mint.publicKey.toString() + '.json')
        return 'https://ipfs.io/ipfs/' + JSONCID;
    } catch (err) {
        console.error("Metadata upload error:", err);
        throw err;
    }
}
