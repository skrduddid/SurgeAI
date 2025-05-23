"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondingCurveAccount = void 0;
const borsh_1 = require("@coral-xyz/borsh");
class BondingCurveAccount {
    constructor(bondingCurveData) {
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
                const [discriminator, virtualTokenReserves, virtualSolReserves, realTokenReserves, realSolReserves, tokenTotalSupply, complete] = arguments;
                this.discriminator = discriminator;
                this.virtualTokenReserves = virtualTokenReserves;
                this.virtualSolReserves = virtualSolReserves;
                this.realTokenReserves = realTokenReserves;
                this.realSolReserves = realSolReserves;
                this.tokenTotalSupply = tokenTotalSupply;
                this.complete = complete;
            }
        }
    }
    getBuyPrice(amount) {
        // if (this.complete) {
        //   throw new Error("Curve is complete");
        // }
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
    getSellPrice(amount, feeBasisPoints) {
        // if (this.complete) {
        //   throw new Error("Curve is complete");
        // }
        if (amount <= 0n) {
            return 0n;
        }
        // Calculate the proportional amount of virtual sol reserves to be received
        let n = (amount * this.virtualSolReserves) / (this.virtualTokenReserves + amount);
        // Calculate the fee amount in the same units
        let a = (n * feeBasisPoints) / 10000n;
        // Return the net amount after deducting the fee
        return n - a;
    }
    getMarketCapSOL() {
        if (this.virtualTokenReserves === 0n) {
            return 0n;
        }
        return ((this.tokenTotalSupply * this.virtualSolReserves) /
            this.virtualTokenReserves);
    }
    getFinalMarketCapSOL(feeBasisPoints) {
        let totalSellValue = this.getBuyOutPrice(this.realTokenReserves, feeBasisPoints);
        let totalVirtualValue = this.virtualSolReserves + totalSellValue;
        let totalVirtualTokens = this.virtualTokenReserves - this.realTokenReserves;
        if (totalVirtualTokens === 0n) {
            return 0n;
        }
        return (this.tokenTotalSupply * totalVirtualValue) / totalVirtualTokens;
    }
    getBuyOutPrice(amount, feeBasisPoints) {
        let solTokens = amount < this.realSolReserves ? this.realSolReserves : amount;
        let totalSellValue = (solTokens * this.virtualSolReserves) /
            (this.virtualTokenReserves - solTokens) +
            1n;
        let fee = (totalSellValue * feeBasisPoints) / 10000n;
        return totalSellValue + fee;
    }
    static fromBuffer(buffer) {
        const structure = (0, borsh_1.struct)([
            (0, borsh_1.u64)("discriminator"),
            (0, borsh_1.u64)("virtualTokenReserves"),
            (0, borsh_1.u64)("virtualSolReserves"),
            (0, borsh_1.u64)("realTokenReserves"),
            (0, borsh_1.u64)("realSolReserves"),
            (0, borsh_1.u64)("tokenTotalSupply"),
            (0, borsh_1.bool)("complete"),
        ]);
        let value = structure.decode(buffer);
        return new BondingCurveAccount({
            discriminator: BigInt(value.discriminator),
            virtualTokenReserves: BigInt(value.virtualTokenReserves),
            virtualSolReserves: BigInt(value.virtualSolReserves),
            realTokenReserves: BigInt(value.realTokenReserves),
            realSolReserves: BigInt(value.realSolReserves),
            tokenTotalSupply: BigInt(value.tokenTotalSupply),
            complete: value.complete
        });
    }
}
exports.BondingCurveAccount = BondingCurveAccount;
