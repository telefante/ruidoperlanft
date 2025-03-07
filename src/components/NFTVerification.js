import React, { useState, useEffect } from "react";
import { request, gql } from "graphql-request";
import { useWallet } from "./WalletContext";

const objktapi = process.env.GATSBY_OBJKT_GRAPHQL_URL || "https://data.ghostnet.objkt.com/v3/graphql";
const contractAddress = process.env.GATSBY_TEZOS_CONTRACT || "KT1...YourContract";
const CACHE_KEY = "nftOwnershipCache";
const CACHE_EXPIRY = 5 * 60 * 1000; // Cache for 5 minutes

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
        const cachedData = getCachedOwnership(address);

        if (cachedData !== null) {
            console.log("✅ Using cached NFT verification result");
            setAccessGranted(cachedData);
            setLoading(false);
            return;
        }

        try {
            const ownsNFT = await checkNFTOwnershipTzKT(address);
            if (ownsNFT) {
                cacheOwnership(address, true);
                setAccessGranted(true);
                setLoading(false);
                return;
            }

            // Fallback to Objkt GraphQL API
            const ownsNFTObjkt = await checkNFTOwnershipObjkt(address);
            if (ownsNFTObjkt) {
                cacheOwnership(address, true);
                setAccessGranted(true);
                setLoading(false);
                return;
            }

            cacheOwnership(address, false);
            setAccessGranted(false);
            setError("You do not own an NFT from this collection.");
        } catch (err) {
            console.error("Error verifying NFT ownership:", err);
            setError("Failed to verify NFT ownership.");
        }
        setLoading(false);
    };

    // Check local storage cache
    const getCachedOwnership = (address) => {
        const cache = localStorage.getItem(CACHE_KEY);
        if (cache) {
            const parsedCache = JSON.parse(cache);
            const cachedEntry = parsedCache[address];

            if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRY) {
                return cachedEntry.ownsNFT; // Return cached result if not expired
            }
        }
        return null; // Cache expired or not found
    };

    // Store result in cache
    const cacheOwnership = (address, ownsNFT) => {
        const cache = localStorage.getItem(CACHE_KEY);
        const parsedCache = cache ? JSON.parse(cache) : {};

        parsedCache[address] = {
            ownsNFT,
            timestamp: Date.now(),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(parsedCache));
    };

    // Primary check: TzKT API (checks ANY NFT in collection)
    const checkNFTOwnershipTzKT = async (address) => {
        const apiUrl = `https://api.tzkt.io/v1/tokens/balances?account=${address}&token.contract=${contractAddress}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.length > 0; // If there's any entry, the user owns at least one NFT
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
            const data = await request(objktapi, query);
            return data.token_holder.length > 0; // If any results, user owns an NFT
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