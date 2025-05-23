import { PublicKey } from "@solana/web3.js";
import { struct, bool, u64, publicKey, Layout } from "@coral-xyz/borsh";
import { Global } from "./new_idl/state";
import { BN } from "bn.js";

⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
  public discriminator: bigint;
  public initialized: boolean = false;
  public authority: PublicKey;
  public feeRecipient: PublicKey;
  public initialVirtualTokenReserves: bigint;
  public initialVirtualSolReserves: bigint;
  public initialRealTokenReserves: bigint;
  public tokenTotalSupply: bigint;
  public feeBasisPoints: bigint;

  constructor(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
    if (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
      if ('authority' in globalData && 'feeRecipient' in globalData) {
        this.initialized = globalData.initialized || false;
        this.authority = globalData.authority;
        this.feeRecipient = globalData.feeRecipient;
        this.initialVirtualTokenReserves = globalData.initialVirtualTokenReserves ? BigInt(globalData.initialVirtualTokenReserves.toString()) : 0n;
        this.initialVirtualSolReserves = globalData.initialVirtualSolReserves ? BigInt(globalData.initialVirtualSolReserves.toString()) : 0n;
        this.initialRealTokenReserves = globalData.initialRealTokenReserves ? BigInt(globalData.initialRealTokenReserves.toString()) : 0n;
        this.tokenTotalSupply = globalData.tokenTotalSupply ? BigInt(globalData.tokenTotalSupply.toString()) : 0n;
        this.feeBasisPoints = globalData.feeBasisPoints ? BigInt(globalData.feeBasisPoints.toString()) : 0n;
      } 
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
        const [discriminator, initialized, authority, feeRecipient, 
               initialVirtualTokenReserves, initialVirtualSolReserves, 
               initialRealTokenReserves, tokenTotalSupply, feeBasisPoints] = arguments;

⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
        this.initialized = initialized;
        this.authority = authority;
        this.feeRecipient = feeRecipient;
        this.initialVirtualTokenReserves = initialVirtualTokenReserves;
        this.initialVirtualSolReserves = initialVirtualSolReserves;
        this.initialRealTokenReserves = initialRealTokenReserves;
        this.tokenTotalSupply = tokenTotalSupply;
        this.feeBasisPoints = feeBasisPoints;
      }
    }
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀

  getInitialBuyPrice(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀): bigint {
    if (amount <= 0n) {
      return 0n;
    }

    let n = this.initialVirtualSolReserves * this.initialVirtualTokenReserves;
    let i = this.initialVirtualSolReserves + amount;
    let r = n / i + 1n;
    let s = this.initialVirtualTokenReserves - r;
    return s < this.initialRealTokenReserves
      ? s
      : this.initialRealTokenReserves;
  }
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
  public static fromBuffer(buffer: Buffer): GlobalAccount {
    const structure: Layout<GlobalAccount> = struct([
      u64("discriminator"),
      bool("initialized"),
      publicKey("authority"),
      publicKey("feeRecipient"),
      u64(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀),
      u64("initialVirtualSolReserves"),
      u64("initialRealTokenReserves"),
      u64("tokenTotalSupply"),
      u64("feeBasisPoints"),
    ]);

    let value = structure.decode(buffer);
    return new GlobalAccount(
      {
        discriminator: BigInt(value.discriminator),
        initialized: value.initialized,
        authority: value.authority,
        feeRecipient: value.feeRecipient,
        initialVirtualTokenReserves: BigInt(value.initialVirtualTokenReserves),
        initialVirtualSolReserves: BigInt(value.initialVirtualSolReserves),
        initialRealTokenReserves: BigInt(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀),
        tokenTotalSupply: BigInt(value.tokenTotalSupply),
        feeBasisPoints: BigInt(value.feeBasisPoints)
      }
    );
  }
}
