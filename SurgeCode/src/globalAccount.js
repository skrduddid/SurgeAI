"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalAccount = void 0;
const borsh_1 = require("@coral-xyz/borsh");
class GlobalAccount {
    constructor(globalData) {
        this.initialized = false;
        if (globalData && typeof globalData === 'object') {
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
            else if (arguments.length >= 9) {
                const [discriminator, initialized, authority, feeRecipient, initialVirtualTokenReserves, initialVirtualSolReserves, initialRealTokenReserves, tokenTotalSupply, feeBasisPoints] = arguments;
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
    getInitialBuyPrice(amount) {
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
    static fromBuffer(buffer) {
        const structure = (0, borsh_1.struct)([
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
        let value = structure.decode(buffer);
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
    }
}
exports.GlobalAccount = GlobalAccount;
