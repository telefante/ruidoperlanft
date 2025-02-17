import Web3 from 'web3';

// Define the contract ABI
const YourContractABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "imageData",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  // Add other functions and events as needed
];

export const mintImage = async (wallet, contractAddress, imageData) => {
  const web3 = new Web3(window.ethereum); // Initialize Web3 with the user's wallet
  const contract = new web3.eth.Contract(YourContractABI, contractAddress); // Use the defined ABI

  try {
    const result = await contract.methods.mint(wallet, imageData).send({
      from: wallet,
      value: web3.utils.toWei('0.01', 'ether') // Adjust value as needed
    });
    return result; // Return the result of the minting transaction
  } catch (error) {
    throw new Error("Minting failed: " + error.message);
  }
};