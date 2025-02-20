import React from "react";
// import { useStaticQuery, graphql } from "gatsby";
import { TezosToolkit } from '@taquito/taquito'; // Import Tezos toolkit

export const mintImage = async (wallet, imageData, contractAddress, rpcUrl) => {
  const tezos = new TezosToolkit(rpcUrl); // Connect to Ghostnet

  // Set the wallet provider
  tezos.setProvider({ signer: wallet });

  try {
    const contract = await tezos.contract.at(contractAddress); // Get the contract instance

    // Call the mint function on the contract
    const operation = await contract.contract.methods.mint(wallet, imageData).send(); // Adjust the method name and parameters as needed

    await operation.confirmation(); // Wait for the operation to be confirmed
    return operation; // Return the result of the minting transaction
  } catch (error) {
    console.error("Minting failed:", error); // Log the error for debugging
    throw new Error("Minting failed: " + error.message);
  }
};