import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { TezosToolkit } from '@taquito/taquito'; // Import Tezos toolkit

export const mintImage = async (wallet, imageData) => {
  // Fetch the contract address from site metadata
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          contractAddress
        }
      }
    }
  `);

  const contractAddress = data.site.siteMetadata.contractAddress; // Get the contract address

  const tezos = new TezosToolkit('https://ghostnet.api.tez.ie'); // Connect to Ghostnet

  // Set the wallet provider
  tezos.setProvider({ signer: wallet });

  try {
    const contract = await tezos.contract.at(contractAddress); // Get the contract instance

    // Call the mint function on the contract
    const operation = await contract.methods.mint(wallet, imageData).send(); // Adjust the method name and parameters as needed

    await operation.confirmation(); // Wait for the operation to be confirmed
    return operation; // Return the result of the minting transaction
  } catch (error) {
    throw new Error("Minting failed: " + error.message);
  }
};