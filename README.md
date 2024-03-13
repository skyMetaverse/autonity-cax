# autonity-cax

The autonity-cax Library is a Node.js module for interacting with the Cax cryptocurrency exchange API. It provides a convenient way to manage API keys, access your cryptocurrency balances, execute trades, and more. Below you will find a comprehensive guide on how to install, configure, and use the autonity-cax library in your Node.js applications.

## Installation

To install the autonity-cax Library, use the following command:

```js
npm i autonity-cax
```

## Usage

Before using the autonity-cax library, you must have a private key for an Ethereum wallet and optionally an existing Cax API key. If you do not have an API key, the library can generate one for you using your Ethereum private key.

#### Here is an example of how to use the autonity-cax library:

```js
const Cax = require('autonity-cax');

// Initialize a new Cax instance with your Ethereum private key
const client = new Cax(YOUR_ETH_PRIVATE_KEY);

// Generate an API key if you don't have one
client.generateApiKey().then(apiKey => {
  console.log("Generated API Key:", apiKey);
});

// Retrieve balances for all symbols
client.getBalances().then(balances => {
  console.log("Balances:", balances);
});

// Retrieve trade history
client.getTradeHistory('ATN-USD').then(tradeHistory => {
  console.log("Trade History for ATN-USD:", tradeHistory);
});
```

## API Reference

The autonity-cax library provides the following methods to interact with the exchange:

### `constructor(privateKey, apiKey)`
Creates a new instance of the Cax client.

### `convertToISO8601(dateString)`
Converts a date string to ISO 8601 format.

### `updateApiKey(apiKey)`
Updates the client instance with a new API key.

### `generateApiKey()`
Generates a new API key from the Cax API using a signed nonce.

### `getBalances(symbol)`
Retrieves balances for a specified currency symbol or all symbols if none is provided.

### `getDeposits(startTime, endTime, symbol)`
Fetches deposit records within a specified time range and for a given symbol.

### `getDepositInfo(txId)`
Fetches detailed information for a specific deposit using its transaction ID.

### `getRefunds(startTime, endTime, symbol)`
Retrieves refund records within a specified time range for a given symbol.

### `getRefundInfo(txId)`
Fetches detailed information about a specific refund transaction.

### `getWithdraws(status, startTime, endTime, symbol)`
Retrieves withdrawals matching the given criteria.

### `requestWithdraw(payload)`
Submits a withdrawal request with the specified details.

### `getWithdrawInfo(txId)`
Fetches detailed information about a specific withdrawal transaction.

### `getOrderbooks()`
Retrieves the current order book data from the API.

### `getOrderbookInfo(pair)`
Retrieves order book data for a specific trading pair.

### `getOrderbookDepth(pair)`
Fetches the depth of the order book for a specific trading pair.

### `getOrderbookQuote(pair)`
Fetches the latest quote for a specific trading pair.

### `getTradeHistory(pair, date)`
Retrieves trade history for a given trading pair, with optional date filtering.

### `getExchangeStatus()`
Fetches the current operational status of the exchange.

### `getSymbols()`
Retrieves the list of all trading pairs available on the exchange.

### `getSymbolsInfo(name)`
Fetches detailed information for a specific trading pair.

### `getOrders(status, startTime, endTime, pair)`
Retrieves orders based on the provided criteria.

### `submitLimitOrder(payload)`
Submits a new limit order with the provided details.

### `getOrderInfo(orderId)`
Fetches detailed information about a specific order.

### `cancelOrder(orderId)`
Cancels an existing order using its ID.

### `getTrades(startTime, endTime, pair, orderId)`
Retrieves trade data based on provided filters.

### `getTradeInfo(tradeId)`
Fetches detailed information for a specific trade.

## References

For more detailed information about the Cax API and additional documentation on its endpoints and features, visit the official Cax API documentation:

- [Cax API Documentation](https://cax.piccadilly.autonity.org/docs/)


Make sure to replace **YOUR_ETH_PRIVATE_KEY** with your actual Ethereum private key.

**Security Note:** Always keep your private keys and API keys secure. Do not expose them in your code or check them into version control.