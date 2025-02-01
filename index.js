const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();  // Load environment variables
const abi = require('./constant/abi.json');


// Initialize the express application
const app = express();

// Use CORS middleware to allow requests from any origin
app.use(cors());

// Middleware to parse JSON bodies of incoming requests
app.use(express.json());

// Load environment variables from .env
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

// Ensure the environment variables are loaded
if (!privateKey ||  !contractAddress) {
    console.error('Missing environment variables! Please check your .env file.');
    process.exit(1);
}

// Initialize provider and contract instance
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/bEZIDXpkK9FqZ1ywvH_xXvnxjRK1gUc6`); // Using Infura as provider
const wallet = new ethers.Wallet(privateKey, provider);
const contractABI = require('./constant/abi.json');  // Import the ABI from your abi.json file
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Default route to test the server
app.get('/', (req, res) => {
    res.send('Express app is running!');
});

// An endpoint that receives a request and performs a task (e.g., marking coin as collected)
app.post('/perform-task', async (req, res) => {
    const { username } = req.body; // The "username" is actually the Ethereum address of the sender

    if (!username) {
        return res.status(400).json({ error: 'Username (Ethereum address) is required' });
    }

    try {

        console.log(`Collecting game points for ${username}...`);
        const tx = await contract.collectGamePoints(username);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction mined:', receipt);

        // Respond back with a success message
        res.status(200).json({
            message: 'Coin marked as collected successfully!',
            transactionHash: tx.hash
        });
    } catch (err) {
        if (err.code === 'CALL_EXCEPTION' && err.shortMessage.includes('Already collected')) {
            // Handle the specific "Already collected" error
            const enhancedError = {
                status: 'error',
                message: 'Action failed: You’ve already collected this item. Please ensure that this action has not been performed previously.',
                transactionDetails: {
                    to: err.transaction.to,
                    from: err.transaction.from,
                    transactionData: err.transaction.data
                },
                suggestion: 'Check your account’s collected items status and try again if necessary.',
                errorCode: err.code,
                debugInfo: {
                    revertReason: err.revert.args[0],  // "Already collected"
                    method: 'eth_estimateGas',
                    jsonrpcVersion: '2.0',
                    requestId: err.info.payload.id
                }
            };

            // Send the enhanced error response
            res.status(400).json(enhancedError);

        } else {
            // Handle other errors or generic ones
            res.status(500).json({
                status: 'error',
                message: 'An unexpected error occurred.',
                error: err
            });
        }}
});

// Specify the port for the server to listen on
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
