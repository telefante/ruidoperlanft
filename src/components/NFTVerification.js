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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { walletAddress, isConnected } = useWallet();
  const [tezos, setTezos] = useState(null);

  // Initialize TezosToolkit only in browser
  useEffect(() => {
    const initTezos = async () => {
      if (isBrowser) {
        try {
          const { TezosToolkit } = await import("@taquito/taquito");
          const tezosToolkit = new TezosToolkit(process.env.GATSBY_TEZOS_RPC_URL);
          setTezos(tezosToolkit);
        } catch (error) {
          console.error("Error initializing TezosToolkit:", error);
        }
      }
    };
    initTezos();
  }, []);

  useEffect(() => {
    if (walletAddress && isConnected) {
      console.log("🔍 Wallet connected, verifying NFT ownership...");
      const cachedResult = getCachedOwnership(walletAddress);
      if (cachedResult !== null) {
        console.log("Using cached result:", cachedResult);
        setAccessGranted(cachedResult);
        setSuccess(cachedResult);
        return;
      }
      verifyOwnership(walletAddress);
    } else {
      console.log("⚠️ No wallet connected, restricting access.");
      setAccessGranted(false);
    }
  }, [walletAddress, isConnected]);

  const verifyOwnership = async (address) => {
    console.log("🟡 Verifying NFT ownership for wallet:", address);
    setLoading(true);

    if (!isBrowser || !tezos) {
      console.log("TezosToolkit not available, skipping verification");
      setLoading(false);
      return;
    }

    try {
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
          const balance = await ledgerMap.get(key);
          console.log(`Checking token ${tokenId} for address ${address}:`, balance);
          return balance && balance.gt(0);
        } catch (err) {
          console.log(`Error checking token ${tokenId}:`, err);
          return false;
        }
      }));

      // Execute all token checks with concurrency control
      const results = await Promise.all(tokenCheckPromises);

      // Check if any token is owned
      if (results.some((ownsToken) => ownsToken)) {
        console.log("🎉 Found token ownership for address:", address);
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
      console.error("Error checking holder status:", error);
      
      // Fallback to Objkt API
      try {
        const objktResult = await checkNFTOwnershipObjkt(address);
        if (objktResult) {
          setAccessGranted(true);
          setSuccess(true);
          setError(null);
          cacheOwnership(address, true);
          return;
        }
      } catch (fallbackErr) {
        console.error("Fallback verification failed:", fallbackErr);
      }
      
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
            <h3>Congratulations! You are already a Ruido Perla's collector</h3>
          </Row>
        </Container>
      )}
      {!success && (
        <Container>
          <Row>
            <h3>Become a collector of Ruido Perla to play with the simulation.</h3>
          </Row>
        </Container>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default NFTVerification;