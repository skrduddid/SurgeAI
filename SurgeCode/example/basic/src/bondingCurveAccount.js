"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BondingCurveAccount = void 0;
var borsh_1 = require("@coral-xyz/borsh");
var BondingCurveAccount = /** @class */ (function () {
    function BondingCurveAccount(bondingCurveData) {
        if (bondingCurveData && typeof bondingCurveData === 'object') {
            // If it's a new BondingCurve structure
            if ('creator' in bondingCurveData && 'virtualTokenReserves' in bondingCurveData) {
                this.virtualTokenReserves = bondingCurveData.virtualTokenReserves ? BigInt(bondingCurveData.virtualTokenReserves.toString()) : 0n;
                this.virtualSolReserves = bondingCurveData.virtualSolReserves ? BigInt(bondingCurveData.virtualSolReserves.toString()) : 0n;
                this.realTokenReserves = bondingCurveData.realTokenReserves ? BigInt(bondingCurveData.realTokenReserves.toString()) : 0n;
                this.realSolReserves = bondingCurveData.realSolReserves ? BigInt(bondingCurveData.realSolReserves.toString()) : 0n;
                this.tokenTotalSupply = bondingCurveData.tokenTotalSupply ? BigInt(bondingCurveData.tokenTotalSupply.toString()) : 0n;
                this.complete = bondingCurveData.complete || false;
                this.creator = bondingCurveData.creator;
            }
            // Support for old construction method
            else if (arguments.length >= 7) {
                var discriminator = arguments[0], virtualTokenReserves = arguments[1], virtualSolReserves = arguments[2], realTokenReserves = arguments[3], realSolReserves = arguments[4], tokenTotalSupply = arguments[5], complete = arguments[6];
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
    BondingCurveAccount.prototype.getBuyPrice = function (amount) {
        // if (this.complete) {
        //   throw new Error("Curve is complete");
        // }
        if (amount <= 0n) {
            return 0n;
        }
        // Calculate the product of virtual reserves
        var n = this.virtualSolReserves * this.virtualTokenReserves;
        // Calculate the new virtual sol reserves after the purchase
        var i = this.virtualSolReserves + amount;
        // Calculate the new virtual token reserves after the purchase
        var r = n / i + 1n;
        // Calculate the amount of tokens to be purchased
        var s = this.virtualTokenReserves - r;
        // Return the minimum of the calculated tokens and real token reserves
        return s < this.realTokenReserves ? s : this.realTokenReserves;
    };
    BondingCurveAccount.prototype.getSellPrice = function (amount, feeBasisPoints) {
        // if (this.complete) {
        //   throw new Error("Curve is complete");
        // }
        if (amount <= 0n) {
            return 0n;
        }
        // Calculate the proportional amount of virtual sol reserves to be received
        var n = (amount * this.virtualSolReserves) / (this.virtualTokenReserves + amount);
        // Calculate the fee amount in the same units
        var a = (n * feeBasisPoints) / 10000n;
        // Return the net amount after deducting the fee
        return n - a;
    };
    BondingCurveAccount.prototype.getMarketCapSOL = function () {
        if (this.virtualTokenReserves === 0n) {
            return 0n;
        }
        return ((this.tokenTotalSupply * this.virtualSolReserves) /
            this.virtualTokenReserves);
    };
    BondingCurveAccount.prototype.getFinalMarketCapSOL = function (feeBasisPoints) {
        var totalSellValue = this.getBuyOutPrice(this.realTokenReserves, feeBasisPoints);
        var totalVirtualValue = this.virtualSolReserves + totalSellValue;
        var totalVirtualTokens = this.virtualTokenReserves - this.realTokenReserves;
        if (totalVirtualTokens === 0n) {
            return 0n;
        }
        return (this.tokenTotalSupply * totalVirtualValue) / totalVirtualTokens;
    };
    BondingCurveAccount.prototype.getBuyOutPrice = function (amount, feeBasisPoints) {
        var solTokens = amount < this.realSolReserves ? this.realSolReserves : amount;
        var totalSellValue = (solTokens * this.virtualSolReserves) /
            (this.virtualTokenReserves - solTokens) +
            1n;
        var fee = (totalSellValue * feeBasisPoints) / 10000n;
        return totalSellValue + fee;
    };
    BondingCurveAccount.fromBuffer = function (buffer) {
        var structure = (0, borsh_1.struct)([
            (0, borsh_1.u64)("discriminator"),
            (0, borsh_1.u64)("virtualTokenReserves"),
            (0, borsh_1.u64)("virtualSolReserves"),
            (0, borsh_1.u64)("realTokenReserves"),
            (0, borsh_1.u64)("realSolReserves"),
            (0, borsh_1.u64)("tokenTotalSupply"),
            (0, borsh_1.bool)("complete"),
        ]);
        var value = structure.decode(buffer);
        return new BondingCurveAccount({
            discriminator: BigInt(value.discriminator),
            virtualTokenReserves: BigInt(value.virtualTokenReserves),
            virtualSolReserves: BigInt(value.virtualSolReserves),
            realTokenReserves: BigInt(value.realTokenReserves),
            realSolReserves: BigInt(value.realSolReserves),
            tokenTotalSupply: BigInt(value.tokenTotalSupply),
            complete: value.complete
        });
    };
    return BondingCurveAccount;
}());
exports.BondingCurveAccount = BondingCurveAccount;
