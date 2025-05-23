⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    Keypair,
    PublicKey,
    Connection,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import fs from "fs";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const authorityKey = __dirname + "/.keys/user.json";
const userList: { secretKey: string, publicKey: string, needAmount: number }[] = [];
for (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀){
    const keypair = Keypair.generate();
    userList.push({
        secretKey: bs58.encode(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀),
        publicKey: keypair.publicKey.toBase58(),
        needAmount: Math.floor(Math.random()*500)/100,
    });
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    JSON.stringify(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
