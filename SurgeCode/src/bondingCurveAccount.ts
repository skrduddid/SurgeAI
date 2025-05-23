import { struct, bool, u64, Layout } from "@coral-xyz/borsh";
import { BondingCurve } from "./new_idl/state";
import { BN } from "bn.js";
import { PublicKey } from "@solana/web3.js";

export class BondingCurveAccount {
  public discriminator: bigint;
  public virtualTokenReserves: bigint;
  public virtualSolReserves: bigint;
  public realTokenReserves: bigint;
  public realSolReserves: bigint;
  public tokenTotalSupply: bigint;
  public complete: boolean;
  public creator: PublicKey;

  constructor(
    bondingCurveData: BondingCurve | any
  ) {
    if (bondingCurveData && typeof bondingCurveData === 'object') {
      if ('creator' in bondingCurveData && 'virtualTokenReserves' in bondingCurveData) {
        this.virtualTokenReserves = bondingCurveData.virtualTokenReserves ? BigInt(bondingCurveData.virtualTokenReserves.toString()) : 0n;
        this.virtualSolReserves = bondingCurveData.virtualSolReserves ? BigInt(bondingCurveData.virtualSolReserves.toString()) : 0n;
        this.realTokenReserves = bondingCurveData.realTokenReserves ? BigInt(bondingCurveData.realTokenReserves.toString()) : 0n;
        this.realSolReserves = bondingCurveData.realSolReserves ? BigInt(bondingCurveData.realSolReserves.toString()) : 0n;
        this.tokenTotalSupply = bondingCurveData.tokenTotalSupply ? BigInt(bondingCurveData.tokenTotalSupply.toString()) : 0n;
        this.complete = bondingCurveData.complete || false;
        this.creator = bondingCurveData.creator;
      } 
      else if (arguments.length >= 7) {
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
               realTokenReserves, realSolReserves, tokenTotalSupply, complete] = arguments;

        this.discriminator = discriminator;
        this.virtualTokenReserves = virtualTokenReserves;
        this.virtualSolReserves = virtualSolReserves;
        this.realTokenReserves = realTokenReserves;
        this.realSolReserves = realSolReserves;
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
        this.complete = complete;
      }
    }
  }

  getBuyPrice(amount: bigint): bigint {
    // if (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    // }
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
    if (amount <= 0n) {
      return 0n;
    }

    // Calculate the product of virtual reserves
    let n = this.virtualSolReserves * this.virtualTokenReserves;

    // Calculate the new virtual sol reserves after the purchase
    let i = this.virtualSolReserves + amount;

    // Calculate the new virtual token reserves after the purchase
    let r = n / i + 1n;

    // Calculate the amount of tokens to be purchased
    let s = this.virtualTokenReserves - r;

    // Return the minimum of the calculated tokens and real token reserves
    return s < this.realTokenReserves ? s : this.realTokenReserves;
  }

  getSellPrice(amount: bigint, feeBasisPoints: bigint): bigint {
    // if (this.complete) {
    //   throw new Error("Curve is complete");
    // }

    if (amount <= 0n) {
      return 0n;
    }

    // Calculate the proportional amount of virtual sol reserves to be received
    let n =
      (amount * this.virtualSolReserves) / (this.virtualTokenReserves + amount);

    // Calculate the fee amount in the same units
    let a = (n * feeBasisPoints) / 10000n;

    // Return the net amount after deducting the fee
    return n - a;
  }
⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀
  getMarketCapSOL(): bigint {
    if (this.virtualTokenReserves === 0n) {
      return 0n;
    }

    return (
      (this.tokenTotalSupply * this.virtualSolReserves) /
      this.virtualTokenReserves
    );
  }

  getFinalMarketCapSOL(feeBasisPoints: bigint): bigint {
    let totalSellValue = this.getBuyOutPrice(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀);
    let totalVirtualValue = this.virtualSolReserves + totalSellValue;
    let totalVirtualTokens = this.virtualTokenReserves - this.realTokenReserves;

    if (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) {
      return 0n;
    }

    return (⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀) / totalVirtualTokens;
  }

  getBuyOutPrice(amount: bigint, feeBasisPoints: bigint): bigint {
    let solTokens =
      amount < this.realSolReserves ? this.realSolReserves : amount;
    let totalSellValue =
      (solTokens * this.virtualSolReserves) /
      (this.virtualTokenReserves - solTokens) +
      1n;
    let fee = (totalSellValue * feeBasisPoints) / 10000n;
    return totalSellValue + fee;
  }

  public static fromBuffer(buffer: Buffer): BondingCurveAccount {
    const structure: Layout<BondingCurveAccount> = struct([
      u64("discriminator"),
      u64("virtualTokenReserves"),
      u64("virtualSolReserves"),
      u64("realTokenReserves"),
      u64("realSolReserves"),
      u64("tokenTotalSupply"),
      bool("complete"),
    ]);

    let value = structure.decode(buffer);
    return new BondingCurveAccount(
      {
        discriminator: BigInt(⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀),
        virtualTokenReserves: BigInt(value.virtualTokenReserves),
        virtualSolReserves: BigInt(value.virtualSolReserves),
        realTokenReserves: BigInt(value.realTokenReserves),
        realSolReserves: BigInt(value.realSolReserves),
        tokenTotalSupply: BigInt(value.tokenTotalSupply),
        complete: value.complete
      }
    );
  }
}
