const axios = require('axios');
const { ethers } = require('ethers');

/**
 * Class representing a client for the Cax API.
 * Allows for managing API keys and retrieving cryptocurrency balances.
 */
class Cax {
    /**
     * Initialize a new Cax instance.
     *
     * @param {string} privateKey - The private key for Ethereum wallet authentication.
     * @param {string} [apiKey] - The existing API key for Cax API, if available.
     */
    constructor(privateKey, apiKey) {
        this.privateKey = privateKey;
        this.wallet = new ethers.Wallet(this.privateKey);
        this.address = this.wallet.address;
        this.baseUrl = "https://cax.piccadilly.autonity.org/api";
        this.apiKey = apiKey;
        this.config = {
            headers: {
                "API-Key": this.apiKey
            }
        };
    };

    /**
     * Converts a date string from 'YYYY-MM-DD-HH:MM:SS' format to the ISO 8601 'YYYY-MM-DDTHH:MM:SSZ' format.
     *
     * @param {string} dateString - The date string to convert in 'YYYY-MM-DD-HH:MM:SS' format.
     * @returns {string} An ISO 8601 formatted date string in 'YYYY-MM-DDTHH:MM:SSZ' format (UTC).
     */
    convertToISO8601(dateString) {
        let isoString = dateString.replace(/(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2}:\d{2})/, '$1T$2');
        let date = new Date(isoString);
        return date.toISOString();
    };

    /**
     * Updates the API key used by the Cax client instance.
     *
     * @param {string} apiKey - The new API key to use for future API calls.
     */
    updateApiKey(apiKey) {
        this.apiKey = apiKey;
        this.config["headers"]["API-Key"] = this.apiKey;
    };

    /**
     * Generates and retrieves a new API key from the Cax API using nonce and signature.
     *
     * @returns {Promise<string>} - A promise that resolves to the newly generated API key.
     */
    async generateApiKey() {
        let message = { "nonce": `${Date.now()}` };
        let sig = await this.wallet.signMessage(JSON.stringify(message));
        let apiKey = await this.createApiKey(sig, message);
        return apiKey;
    };

    /**
     * Helper method to create a new API key by posting a signed message to the Cax API.
     * 
     * @param {string} sig - The signature of the signed nonce message.
     * @param {object} payload - The payload containing the nonce.
     * @returns {Promise<string>} - A promise that resolves to the newly generated API key.
     */
    async createApiKey(sig, payload) {
        let config = {
            headers: {
                "api-sig": sig
            }
        };
        let res = await axios.post(`${this.baseUrl}/apikeys`, payload, config);
        this.updateApiKey(res.data.apikey);
        return res.data.apikey;
    };

    /**
     * Retrieves the account balances from the Cax API. If a symbol is provided,
     * retrieves the balance for that specific symbol.
     * 
     * @param {string} [symbol] - The symbol of the cryptocurrency to retrieve the balance for.
     * @returns {Promise<Object>} - A promise that resolves to an object containing balance information.
     */
    async getBalances(symbol) {
        if (!this.apiKey) { await this.generateApiKey() };

        let url = symbol ? `${this.baseUrl}/balances/${symbol}` : `${this.baseUrl}/balances`;
        let res = await axios.get(url, this.config);
        return res.data;
    };

    /**
     * Retrieves deposit records from the API within a specified time range for a given symbol.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} startTime - The start of the time range for which to retrieve deposits in 'YYYY-MM-DD-HH:MM:SS' format.
     * @param {string} endTime - The end of the time range for which to retrieve deposits in 'YYYY-MM-DD-HH:MM:SS' format.
     * @param {string} symbol - The trading symbol to filter the deposit records.
     * @returns {Promise<Object>} A promise that resolves with the deposit data from the API.
     */
    async getDeposits(startTime, endTime, symbol) {
        if (!this.apiKey) { await this.generateApiKey() };

        let url = (startTime && endTime && symbol)
            ? `${this.baseUrl}/deposits/?end=${this.convertToISO8601(endTime)}&start=${this.convertToISO8601(startTime)}&symbol=${symbol}`
            : `${this.baseUrl}/deposits`;

        let res = await axios.get(url, this.config);
        return res.data;
    };

    /**
     * Fetches detailed information for a specific deposit transaction based on its transaction ID.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} txId - The transaction ID of the deposit to retrieve information for.
     * @returns {Promise<Object>} A promise that resolves with the detailed information of the specific deposit transaction.
     */
    async getDepositInfo(txId) {
        if (!this.apiKey) { await this.generateApiKey() };

        let res = await axios.get(`${this.baseUrl}/deposits/${txId}`, this.config);
        return res.data;
    };

    /**
     * Retrieves a list of refunds from the API within a specified time range and for a particular trading symbol.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} startTime - The start of the time range for which to retrieve deposits in 'YYYY-MM-DD-HH:MM:SS' format.
     * @param {string} endTime - The end of the time range for which to retrieve deposits in 'YYYY-MM-DD-HH:MM:SS' format.
     * @param {string} symbol - The trading symbol to filter the deposit records.
     * @returns {Promise<Array>} A promise that resolves with an array of refund transactions.
     */
    async getRefunds(startTime, endTime, symbol) {
        if (!this.apiKey) { await this.generateApiKey() };

        let url = (startTime && endTime && symbol)
            ? `${this.baseUrl}/refunds/?end=${this.convertToISO8601(endTime)}&start=${this.convertToISO8601(startTime)}&symbol=${symbol}`
            : `${this.baseUrl}/refunds`;

        let res = await axios.get(url, this.config);
        return res.data;
    };

    /**
     * Retrieves detailed information about a specific refund transaction from the API using the transaction ID.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} txId - The unique identifier for the refund transaction to retrieve.
     * @returns {Promise<Object>} A promise that resolves with the detailed data of the specified refund transaction.
     */
    async getRefundInfo(txId) {
        if (!this.apiKey) { await this.generateApiKey() };

        let res = await axios.get(`${this.baseUrl}/refunds/${txId}`, this.config);
        return res.data;
    };

    /**
     * Retrieves a list of withdrawals that match the given criteria such as status, time range, and trading symbol from the API.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} status - The status of the orders to retrieve (e.g., "accepted", "pending", "complete", "failed", "error", "refunded").
     * @param {string} startTime - The start of the time range for which to retrieve deposits in 'YYYY-MM-DD-HH:MM:SS' format.
     * @param {string} endTime - The end of the time range for which to retrieve deposits in 'YYYY-MM-DD-HH:MM:SS' format.
     * @param {string} symbol - The trading symbol to filter the withdrawals by.
     * @returns {Promise<Array>} A promise that resolves with an array containing the withdrawals that meet the criteria.
     */
    async getWithdraws(status, startTime, endTime, symbol) {
        if (!this.apiKey) { await this.generateApiKey() };

        let url = (status && startTime && endTime && symbol)
            ? `${this.baseUrl}/withdraws/?status=${status}&end=${this.convertToISO8601(endTime)}&start=${this.convertToISO8601(startTime)}&symbol=${symbol}`
            : `${this.baseUrl}/withdraws`;

        let res = await axios.get(url, this.config);
        return res.data;
    };

    /**
     * Initiates a request to withdraw funds from the trading platform using the provided payload containing withdrawal details.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {Object} payload - An object containing the withdrawal request details.
     *                The object format is:
     *                {
     *                    "amount": "string",  // The amount of funds to withdraw
     *                    "symbol": "string"   // The trading symbol (currency) to withdraw
     *                }
     *
     * @returns {Promise<Object>} A promise that resolves with the response data from the withdrawal request.
     */
    async requestWithdraw(payload) {
        if (!this.apiKey) { await this.generateApiKey() };

        let res = await axios.post(`${this.baseUrl}/withdraws`, payload, this.config);
        return res.data;
    };

    /**
     * Retrieves detailed information about a specific withdrawal transaction from the API using the transaction ID.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} txId - The unique identifier for the withdrawal transaction to retrieve information for.
     * @returns {Promise<Object>} A promise that resolves with the data of the specific withdrawal transaction.
     */
    async getWithdrawInfo(txId) {
        if (!this.apiKey) { await this.generateApiKey() };

        let res = await axios.get(`${this.baseUrl}/withdraws/${txId}`, this.config);
        return res.data;
    };

    /**
     * Fetches the current order book data from the API.
     *
     * @returns {Promise<Object>} A promise that resolves with the current state of the order book.
     */
    async getOrderbooks() {
        let res = await axios.get(`${this.baseUrl}/orderbooks`, this.config);
        return res.data;
    };

    /**
     * Retrieves order book information for a specific trading pair from the API.
     *
     * @param {string} pair - The trading pair identifier for which to get the order book information.
     * @returns {Promise<Object>} A promise that resolves with the order book data for the specified trading pair.
     */
    async getOrderbookInfo(pair) {
        let res = await axios.get(`${this.baseUrl}/orderbooks/${pair}`);
        return res.data;
    };

    /**
     * Fetches the depth of the order book for a given trading pair from the API.
     * The depth of an order book represents the quantities of bids and asks at different price levels.
     *
     * @param {string} pair - The identifier of the trading pair to retrieve the order book depth for.
     * @returns {Promise<Object>} A promise that resolves with the depth information of the order book for the specified trading pair.
     */
    async getOrderbookDepth(pair) {
        let res = await axios.get(`${this.baseUrl}/orderbooks/${pair}/depth`);
        return res.data;
    };

    /**
     * Obtains the latest quote for a specific trading pair from the order book through the API.
     * A quote typically includes information like the last traded price, and the bid and ask prices.
     *
     * @param {string} pair - The trading pair identifier to fetch the latest quote for.
     * @returns {Promise<Object>} A promise that resolves with the quote of the order book for the specified trading pair.
     */
    async getOrderbookQuote(pair) {
        let res = await axios.get(`${this.baseUrl}/orderbooks/${pair}/quote`);
        return res.data;
    };

    /**
     * Retrieves trade history data for a given trading pair. By default, it returns the last 24 hours of trade data.
     * If a specific date is provided, it fetches the historical trade data for that day.
     *
     * @param {string} pair - The trading pair identifier for which to retrieve trade history.
     * @param {string} [date] - Optional. The date in 'YYYY-MM-DD' format to retrieve historical trades for a single day.
     * @returns {Promise<Object>} A promise that resolves with the trade history for the specified trading pair.
     * The data includes trades information such as prices, volumes, and timestamps.
     */
    async getTradeHistory(pair, date) {
        let url = date ? `${this.baseUrl}/orderbooks/${pair}/trades/?data=${date}` : `${this.baseUrl}/orderbooks/${pair}/trades`;
        let res = await axios.get(url);
        return res.data;
    };

    /**
     * Retrieves the current status of the exchange. This can include operational status, API availability, 
     * and other relevant service conditions.
     *
     * @returns {Promise<Boolean>} A promise that resolves with the status information of the exchange.
     */
    async getExchangeStatus() {
        let res = await axios.get(`${this.baseUrl}/status`);
        return res.data;
    };

    /**
     * Fetches the list of all trading pairs (symbols) available on the exchange.
     *
     * @returns {Promise<Array>} A promise that resolves with an array of symbols.
     * Each symbol represents a trading pair available for transactions on the exchange.
     */
    async getSymbols() {
        let res = await axios.get(`${this.baseUrl}/symbols`);
        return res.data;
    };

    /**
     * Retrieves detailed information for a specific trading pair (symbol).
     *
     * @param {string} name - The name of the trading pair to retrieve information for.
     * @returns {Promise<Object>} A promise that resolves with an object containing information about the specified symbol.
     */
    async getSymbolsInfo(name) {
        let res = await axios.get(`${this.baseUrl}/symbols/${name}`);
        return res.data;
    };

    /**
     * Fetches a list of orders based on the provided status, time range, and trading pair.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} status - The status of the orders to retrieve (e.g., "accepted", "pending", "complete", "failed", "error", "refunded").
     * @param {string} startTime - The start of the time range for which to retrieve deposits in 'YYYY-MM-DD-HH:MM:SS' format.
     * @param {string} endTime - The end of the time range for which to retrieve deposits in 'YYYY-MM-DD-HH:MM:SS' format.
     * @param {string} pair - The specific trading pair to filter orders by.
     * @returns {Promise<Array>} A promise that resolves with an array of order objects matching the criteria.
     */
    async getOrders(status, startTime, endTime, pair) {
        if (!this.apiKey) { await this.generateApiKey() };

        let url = (status && startTime && endTime && pair)
            ? `${this.baseUrl}/orders/?status=${status}&end=${this.convertToISO8601(endTime)}&start=${this.convertToISO8601(startTime)}&symbol=${pair}`
            : `${this.baseUrl}/orders`;

        let res = await axios.get(url, this.config);
        return res.data;
    };

    /**
     * Submits a new limit order with the specified details.
     * If the API key is not set, it triggers an API key generation before making the API call.
     * 
     * The payload should have the following structure:
     * {
     *     "amount": "string", // The amount of the asset to buy or sell
     *     "pair": "string",   // The trading pair for the order (e.g., 'ATN-USD')
     *     "price": "string",  // The price at which to execute the order
     *     "side": "bid"       // The order side, either 'bid' for buy or 'ask' for sell
     * }
     *
     * @param {Object} payload - The order details.
     * @returns {Promise<Object>} A promise that resolves with the response data from the order submission.
     */
    async submitLimitOrder(payload) {
        if (!this.apiKey) { await this.generateApiKey() };

        let res = await axios.post(`${this.baseUrl}/orders/`, payload, this.config);
        return res.data;
    };

    /**
     * Retrieves detailed information about a specific order using its unique identifier.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} orderId - The unique identifier for the order you want information about.
     * @returns {Promise<Object>} A promise that resolves with the order's information.
     */
    async getOrderInfo(orderId) {
        if (!this.apiKey) { await this.generateApiKey() };

        let res = await axios.get(`${this.baseUrl}/orders/${orderId}`, this.config);
        return res.data;
    };

    /**
     * Cancels an existing order based on the provided order ID.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} orderId - The unique identifier of the order to cancel.
     * @returns {Promise<Object>} A promise that resolves with the response data of the cancellation request.
     */
    async cancelOrder(orderId) {
        if (!this.apiKey) { await this.generateApiKey() };

        let res = await axios.delete(`${this.baseUrl}/orders/${orderId}`, this.config);
        return res.data;
    };

    /**
     * Retrieves a list of trades filtered by the given parameters. If both start time and end time are provided,
     * along with a specific pair and order ID, the request is tailored to include those filters. If any of these
     * parameters are missing, all trades are fetched. 
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {number} startTime - The beginning of the time range for the trades query.
     * @param {number} endTime - The end of the time range for the trades query.
     * @param {string} pair - The currency pair for which trades should be fetched.
     * @param {string} orderId - The unique identifier for filtering trades by a specific order.
     * @returns {Promise<Array>} A promise that resolves with the requested trades data.
     */
    async getTrades(startTime, endTime, pair, orderId) {
        if (!this.apiKey) { await this.generateApiKey() };

        let url = (startTime && endTime && pair && orderId)
            ? `${this.baseUrl}/trades/?end=${this.convertToISO8601(endTime)}&start=${this.convertToISO8601(startTime)}&pair=${pair}&orderId=${orderId}`
            : `${this.baseUrl}/orders`;

        let res = await axios.get(url, this.config);
        return res.data;
    };

    /**
     * Retrieves detailed information for a specific trade by its unique trade ID.
     * If the API key is not set, it triggers an API key generation before making the API call.
     *
     * @param {string} tradeId - The unique identifier of the trade to retrieve information for.
     * @returns {Promise<Object>} A promise that resolves with the data for the specified trade.
     */
    async getTradeInfo(tradeId) {
        if (!this.apiKey) { await this.generateApiKey() };

        let res = await axios.get(`${this.baseUrl}/trades/${tradeId}`, this.config);
        return res.data;
    };
};

module.exports = Cax;

