import React, { useState, useEffect } from "react";
import { request, gql } from "graphql-request";
import { useWallet } from "./WalletContext";
import { Container, Row } from "react-bootstrap";
import { BigNumber } from 'bignumber.js';
import pLimit from 'p-limit';

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

const objktapi = process.env.GATSBY_OBJKT_GRAPHQL_URL;
const RuidoPerlaNFTContract = process.env.GATSBY_RUIDOPERLANFT_CONTRACT; 
const CACHE_KEY = "nftOwnershipCache";
const CACHE_EXPIRY = 5 * 60 * 1000; // Cache for 5 minutes

// Remove direct TezosToolkit initialization
// const tezos = new TezosToolkit(process.env.GATSBY_TEZOS_RPC_URL);

// Example environment variables
// const BASE_URL = process.env.GATSBY_TZKT_API_URL; // e.g., "https://api.tzkt.io"
// const API_VERSION = process.env.GATSBY_API_VERSION; // e.g., "v1"
// const NETWORK = process.env.GATSBY_NETWORK; // e.g., "ghostnet"

const isGreaterThanZero = (value) => {
  if (!value) return false;
  try {
    return BigNumber(value).gt(0);
  } catch {
    return false;
  }
};

const NFTVerification = ({ setAccessGranted }) => {
  const { walletAddress, isConnected, tezos } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Add dependency array items to track
  const [lastVerifiedAddress, setLastVerifiedAddress] = useState(null);

  useEffect(() => {
    const initVerification = async () => {
      // Log current state for debugging
      console.log("NFTVerification - State Update:", {
        walletAddress,
        isConnected,
        hasTezos: !!tezos,
        lastVerifiedAddress,
        loading
      });

      // Only proceed if we have all required values and haven't verified this address yet
      if (walletAddress && 
          isConnected && 
          tezos && 
          walletAddress !== lastVerifiedAddress && 
          !loading) {
        
        console.log("🔍 Starting new verification for address:", walletAddress);
        setLastVerifiedAddress(walletAddress);

        // Check cache first
        const cachedResult = getCachedOwnership(walletAddress);
        if (cachedResult !== null) {
          console.log("Using cached verification result for:", walletAddress);
          setAccessGranted(cachedResult);
          setSuccess(cachedResult);
          setError(null);
          return;
        }

        // If no cache or expired, proceed with verification
        await verifyOwnership(walletAddress);
      } else {
        console.log("⚠️ Verification skipped:", {
          hasAddress: !!walletAddress,
          isConnected,
          hasTezos: !!tezos,
          isSameAddress: walletAddress === lastVerifiedAddress,
          isLoading: loading
        });
        
        if (!walletAddress || !isConnected) {
          setAccessGranted(false);
          setSuccess(false);
          setError(null);
        }
      }
    };

    initVerification();
  }, [walletAddress, isConnected, tezos, lastVerifiedAddress, loading]);

  const verifyOwnership = async (address) => {
    if (!address || !tezos) {
      console.log("Missing requirements for verification");
      return;
    }
    
    console.log("🟡 Verifying NFT ownership for wallet:", address);
    setLoading(true);

    try {
      // Check cache first
      const cachedResult = getCachedOwnership(address);
      if (cachedResult !== null) {
        console.log("Using cached verification result");
        setAccessGranted(cachedResult);
        setSuccess(cachedResult);
        setError(null);
        setLoading(false);
        return;
      }

      // Primary check using Objkt API
      const objktResult = await checkNFTOwnershipObjkt(address);
      if (objktResult) {
        console.log("🎉 Found token ownership for address via Objkt API:", address);
        setAccessGranted(true);
        setSuccess(true);
        setError(null);
        cacheOwnership(address, true);
        setLoading(false);
        return;
      }

      // Fallback to contract ledger check
      const contract = await tezos.wallet.at(RuidoPerlaNFTContract);
      const storage = await contract.storage();
      const totalSupplyMap = storage.assets.token_total_supply;
      const ledgerMap = storage.assets.ledger;
      const tokenIds = Array.from({ length: 100 }, (_, i) => i);

      // Limit the number of concurrent requests
      const limit = pLimit(5); // Adjust the number to control concurrency

      // Create an array of limited promises for each token check
      const tokenCheckPromises = tokenIds.map((tokenId) => limit(async () => {
        try {
          const key = { 0: address, 1: tokenId };
          console.log(`Fetching big map value for key:`, key);
          const balance = await ledgerMap.get(key);
          console.log(`Checking token ${tokenId} for address ${address}:`, balance);
          return balance && balance.gt(0);
        } catch (err) {
          console.error(`Error fetching big map value for token ${tokenId}:`, err);
          return false;
        }
      }));

      // Execute all token checks with concurrency control
      const results = await Promise.all(tokenCheckPromises);

      // Check if any token is owned
      if (results.some((ownsToken) => ownsToken)) {
        console.log("🎉 Found token ownership for address via contract ledger:", address);
        setAccessGranted(true);
        setSuccess(true);
        setError(null);
        cacheOwnership(address, true);
      } else {
        console.log("❌ No tokens found for address:", address);
        setAccessGranted(false);
        setSuccess(false);
        setError("You do not own an NFT from this collection.");
        cacheOwnership(address, false);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Failed to verify NFT ownership. Please try again later.");
      setAccessGranted(false);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const getCachedOwnership = (address) => {
    // Temporarily disable cache by always returning null
    // return null;

    // Original cache logic (commented out)
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      const parsedCache = JSON.parse(cache);
      const cachedEntry = parsedCache[address];

      if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRY) {
        return cachedEntry.ownsNFT;
      }
    }
    return null;
  };

  const cacheOwnership = (address, ownsNFT) => {
    const cache = localStorage.getItem(CACHE_KEY);
    const parsedCache = cache ? JSON.parse(cache) : {};

    parsedCache[address] = {
      ownsNFT,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(parsedCache));
  };

  const checkNFTOwnershipTzKT = async (address) => {
    // Construct the URL using environment variables
    const apiUrl = `${process.env.GATSBY_TZKT_API_URL}/${process.env.GATSBY_API_VERSION}/tokens/balances?account=${address}&token.contract=${RuidoPerlaNFTContract}`;
    
    console.log("TzKT API Request:", apiUrl);
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log("TzKT API Response:", data);
      return data.length > 0;
    } catch (error) {
      console.error("TzKT API Error:", error);
      return false;
    }
  };

  const checkNFTOwnershipObjkt = async (address) => {
    const query = gql`
      query {
        token_holder(
          where: {
            holder_address: { _eq: "${address}" }
            token: { fa_contract: { _eq: "${RuidoPerlaNFTContract}" } }
          }
        ) {
          quantity
        }
      }
    `;
    try {
      const data = await request(objktapi, query);
      console.log("Objkt API Response:", data);

      const totalNFTsOwned = data.token_holder.reduce(
        (sum, holder) => sum + holder.quantity,
        0
      );

      return totalNFTsOwned > 0;
    } catch (error) {
      console.error("Objkt API Error:", error);
      return false;
    }
  };

  return (
    <div>
      {loading && <p>Checking NFT ownership...</p>}
      {success && (
        <Container id="communication">
          <Row>
            <h3>as holder of RuidoPerla NFT you can mint an image from the simulation</h3>
          </Row>
        </Container>
      )}
      {!success && (
        <Container>
          <Row>
            <h2>Becoming a <a  href="#collection">collector</a> of Ruido Perla you will be able to mint in real time</h2>
   
          </Row>
        </Container>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default NFTVerification;