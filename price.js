const express = require('express');
const { ethers } = require('ethers');
const { ERC20ABI, LPABI } = require('./abi');

const app = express();
const PORT = process.env.PORT || 3000;

const RPC_URL = 'https://mainnet.infura.io/v3/xyz';
const provider = new ethers.JsonRpcProvider(RPC_URL);
async function getPriceInUSDT(TOKEN_ADDRESS) {
    const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const UNISWAP_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

    try {
        // Fetch the pair address from Uniswap Factory
        const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, [
            "function getPair(address, address) external view returns (address)"
        ], provider);

        const pairAddress = await factory.getPair(USDT_ADDRESS, TOKEN_ADDRESS);
        if (pairAddress === ethers.ZeroAddress) {
            console.log("Pair not found on Uniswap.");
            return null;
        }
        const pairContract = new ethers.Contract(pairAddress, LPABI, provider);
        const token0Address = await pairContract.token0();
        const token1Address = await pairContract.token1();

        const token0Contract = new ethers.Contract(token0Address, ERC20ABI, provider);
        const token1Contract = new ethers.Contract(token1Address, ERC20ABI, provider);
        const decimals0 = await token0Contract.decimals();
        const decimals1 = await token1Contract.decimals();
        const [reserve0, reserve1] = await pairContract.getReserves();
        let tokenPrice;
        if (token0Address.toLowerCase() === TOKEN_ADDRESS.toLowerCase()) {
            tokenPrice = parseFloat(ethers.formatUnits(reserve1, decimals1)) /
                         parseFloat(ethers.formatUnits(reserve0, decimals0));
        } else {
            tokenPrice = parseFloat(ethers.formatUnits(reserve0, decimals0)) /
                         parseFloat(ethers.formatUnits(reserve1, decimals1));
        }

        return tokenPrice;
    } catch (error) {
        console.error("Error fetching token price:", error);
        return null;
    }
}
async function fetchTokenPrices(lpAddr) {
    try {
        const lpContract = new ethers.Contract(lpAddr, LPABI, provider);
        const [token0Addr, token1Addr] = await Promise.all([
            lpContract.token0(),
            lpContract.token1(),
        ]);
        const token0Contract = new ethers.Contract(token0Addr, ERC20ABI, provider);
        const token1Contract = new ethers.Contract(token1Addr, ERC20ABI, provider);
        const [decimals0, decimals1] = await Promise.all([
            token0Contract.decimals(),
            token1Contract.decimals(),
        ]);
        const reserves = await lpContract.getReserves();
        const reserve0 = parseFloat(ethers.formatUnits(reserves[0], decimals0));
        const reserve1 = parseFloat(ethers.formatUnits(reserves[1], decimals1));
        const price0to1 = reserve1 / reserve0;
        const price1to0 = reserve0 / reserve1;
        const priceFormatted = `${price0to1.toFixed(18)}`;
        const inversePriceFormatted = `${price1to0.toFixed(18)}`;
        const priceToken0InUSDT = await getPriceInUSDT(token0Addr);
        const priceToken1InUSDT = await getPriceInUSDT(token1Addr);
        return {
            token0: token0Addr,
            token1: token1Addr,
            price: priceFormatted,
            inversePrice: inversePriceFormatted,
            priceToken0InUSDT : priceToken0InUSDT,
            priceToken1InUSDT : priceToken1InUSDT,
        };
    } catch (error) {
        console.error("Error fetching token prices:", error.message);
        throw new Error("Failed to fetch token prices");
    }
}



// API endpoint to get token prices
app.get('/api/token-price/:lpAddress', async (req, res) => {
    const { lpAddress } = req.params;

    if (!lpAddress) {
        return res.status(400).json({ error: "LP address is required" });
    }

    try {
        const prices = await fetchTokenPrices(lpAddress);
        return res.status(200).json(prices);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});