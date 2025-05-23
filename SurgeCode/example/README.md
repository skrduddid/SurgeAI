# LP Token Checker Tool

This tool is used to check if a wallet holds LP tokens (Liquidity Provider tokens) for a specific pump.fun token.

## Background

On the pump.fun platform, when you create a new token and perform the `createAndBuy` operation, the following steps actually occur:

1. A new token (Mint Account) is created.
2. A bonding curve account (Bonding Curve Account) is created.
3. The SOL you provide and a portion of the newly created tokens are placed into the liquidity pool.
4. As a liquidity provider, you receive LP tokens, representing your share in that liquidity pool.

This tool helps you verify if you hold these LP tokens and the liquidity value they represent.

## Usage

```bash
# Install dependencies
npm install

# Run the tool
npx ts-node example/check-lp-tokens.ts <wallet_private_key> <token_address>
```

### Parameter Description

- `<wallet_private_key>`: The private key of the wallet used when creating the token (Base58 format).
- `<token_address>`: The mint address of the token you created.

### Example

```bash
npx ts-node example/check-lp-tokens.ts 5RaEXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx 4wcJSDGVN6z9z79vuH5p2nVrowWPfiaNokaHY9f8ttxb
```

## Output Information

The tool will output the following information:

1. Basic information about the token (total supply, decimals, etc.).
2. Bonding curve account information (virtual reserves, real reserves, etc.).
3. LP token address.
4. Whether LP tokens are held.
   - If held, it will display the quantity held, percentage, and estimated value.
   - If not held, it will check if the token itself is held.

## Notes

- Please ensure the environment variable `HELIUS_RPC_URL` is set. You can set it in the `.env` file in the project root directory.
- Private key information is very sensitive; please do not use it in insecure environments.
- This tool only reads on-chain data and does not perform any modification operations.

## Frequently Asked Questions

**Q: Why don't I see the token I created in my wallet after creating it?**  
A: On the pump.fun platform, when you create a token and perform the initial purchase, you receive LP tokens, not the token itself. If you want to hold the token you created, you need to purchase it through the pump.fun platform using another wallet (or the same wallet) after creation.

**Q: What are LP tokens used for?**  
A: LP tokens represent your share in the liquidity pool. When others trade this token, a portion of the transaction fees is distributed proportionally to LP holders. You can also "remove liquidity" at any time to retrieve your SOL and tokens.

**Q: How do I get the token I created?**  
A: Visit your token page on pump.fun, connect your wallet, and perform a purchase operation. 