// Replace these with your actual ABIs
const ERC20ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "name": "", "type": "string" }],
        "type": "function"
    }
];

const LPABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "token0",
        "outputs": [{ "name": "", "type": "address" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "token1",
        "outputs": [{ "name": "", "type": "address" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getReserves",
        "outputs": [
            { "name": "reserve0", "type": "uint112" },
            { "name": "reserve1", "type": "uint112" },
            { "name": "blockTimestampLast", "type": "uint32" }
        ],
        "type": "function"
    }
];

module.exports = { ERC20ABI, LPABI };
