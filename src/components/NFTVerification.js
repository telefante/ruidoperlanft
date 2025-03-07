import React, { useState, useEffect } from "react";
import { request, gql } from "graphql-request";
import { useWallet } from "./WalletContext";


const contractAddress = "KT1...YourNFTContract"; // Replace with your NFT contract address
const tokenId = "1234"; // Replace with your specific NFT ID
const objktGraphQL = "https://data.objkt.com/v3/graphql"; // Objkt API Endpoint

const NFTVerification = ({ setAccessGranted }) => {
    const { walletAddress } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!walletAddress) return;
        verifyOwnership(walletAddress);
    }, [walletAddress]);

    const verifyOwnership = async (address) => {
        setLoading(true);
        try {
            const ownsNFT = await checkNFTOwnershipTzKT(address);
            if (ownsNFT) {
                setAccessGranted(true);
                setLoading(false);
                return;
            }

            // Fallback to Objkt GraphQL API
            const ownsNFTObjkt = await checkNFTOwnershipObjkt(address);
            if (ownsNFTObjkt) {
                setAccessGranted(true);
                setLoading(false);
                return;
            }

            setAccessGranted(false);
            setError("You do not own the required NFT.");
        } catch (err) {
            console.error("Error verifying NFT ownership:", err);
            setError("Failed to verify NFT ownership.");
        }
        setLoading(false);
    };

    // Primary check: TzKT API
    const checkNFTOwnershipTzKT = async (address) => {
        const apiUrl = `https://api.tzkt.io/v1/tokens/balances?account=${address}&token.contract=${contractAddress}&token.tokenId=${tokenId}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.length > 0;
    };

    // Fallback check: Objkt.com GraphQL API
    const checkNFTOwnershipObjkt = async (address) => {
        const query = gql`
            query {
                token_holder(where: { holder_address: { _eq: "${address}" }, fa2_id: { _eq: "${contractAddress}" } }) {
                    quantity
                }
            }
        `;
        try {
            const data = await request(objktGraphQL, query);
            return data.token_holder.length > 0;
        } catch (error) {
            console.error("Objkt API Error:", error);
            return false;
        }
    };

    return (
        <div>
            {loading && <p>Checking NFT ownership...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default NFTVerification;