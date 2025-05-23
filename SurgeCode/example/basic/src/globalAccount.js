"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalAccount = void 0;
var borsh_1 = require("@coral-xyz/borsh");
var GlobalAccount = /** @class */ (function () {
    function GlobalAccount(globalData) {
        this.initialized = false;
        if (globalData && typeof globalData === 'object') {
            // If it's a new Global structure
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
            // Support for old construction method
            else if (arguments.length >= 9) {
                var discriminator = arguments[0], initialized = arguments[1], authority = arguments[2], feeRecipient = arguments[3], initialVirtualTokenReserves = arguments[4], initialVirtualSolReserves = arguments[5], initialRealTokenReserves = arguments[6], tokenTotalSupply = arguments[7], feeBasisPoints = arguments[8];
                this.discriminator = discriminator;
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
    }
    GlobalAccount.prototype.getInitialBuyPrice = function (amount) {
        if (amount <= 0n) {
            return 0n;
        }
        var n = this.initialVirtualSolReserves * this.initialVirtualTokenReserves;
        var i = this.initialVirtualSolReserves + amount;
        var r = n / i + 1n;
        var s = this.initialVirtualTokenReserves - r;
        return s < this.initialRealTokenReserves
            ? s
            : this.initialRealTokenReserves;
    };
    GlobalAccount.fromBuffer = function (buffer) {
        var structure = (0, borsh_1.struct)([
            (0, borsh_1.u64)("discriminator"),
            (0, borsh_1.bool)("initialized"),
            (0, borsh_1.publicKey)("authority"),
            (0, borsh_1.publicKey)("feeRecipient"),
            (0, borsh_1.u64)("initialVirtualTokenReserves"),
            (0, borsh_1.u64)("initialVirtualSolReserves"),
            (0, borsh_1.u64)("initialRealTokenReserves"),
            (0, borsh_1.u64)("tokenTotalSupply"),
            (0, borsh_1.u64)("feeBasisPoints"),
        ]);
        var value = structure.decode(buffer);
        return new GlobalAccount({
            discriminator: BigInt(value.discriminator),
            initialized: value.initialized,
            authority: value.authority,
            feeRecipient: value.feeRecipient,
            initialVirtualTokenReserves: BigInt(value.initialVirtualTokenReserves),
            initialVirtualSolReserves: BigInt(value.initialVirtualSolReserves),
            initialRealTokenReserves: BigInt(value.initialRealTokenReserves),
            tokenTotalSupply: BigInt(value.tokenTotalSupply),
            feeBasisPoints: BigInt(value.feeBasisPoints)
        });
    };
    return GlobalAccount;
}());
exports.GlobalAccount = GlobalAccount;
