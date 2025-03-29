import React, { useState, useEffect } from "react";
import { request, gql } from "graphql-request";
import { useWallet } from "./WalletContext";
import { Container, Row } from "react-bootstrap";
import { BigNumber } from 'bignumber.js';

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

const objktapi = process.env.GATSBY_OBJKT_GRAPHQL_URL;
const RuidoPerlaNFTContract = process.env.GATSBY_RUIDOPERLANFT_CONTRACT;
const CACHE_KEY = "nftOwnershipCache";
const CACHE_EXPIRY = 5 * 60 * 1000; // Cache for 5 minutes

// Remove direct TezosToolkit initialization
// const tezos = new TezosToolkit(process.env.GATSBY_TEZOS_RPC_URL);

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
  const { walletAddress } = useWallet();
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
      
      // Get the total supply to know how many tokens to check
      const totalSupplyMap = storage.assets.token_total_supply;
      const tokenMetadataMap = storage.assets.token_metadata;
      const ledgerMap = storage.assets.ledger;

      // Get token IDs from metadata (usually 0 to total supply - 1)
      const tokenIds = Array.from({ length: 10 }, (_, i) => i); // Check first 10 tokens
      
      // Check each token ID
      for (const tokenId of tokenIds) {
        try {
          // Create the key for the ledger big map (format depends on your contract)
          const key = { 0: address, 1: tokenId }; // or `${address},${tokenId}` depending on your contract
          
          // Check if this address owns this token
          const balance = await ledgerMap.get(key);
          console.log(`Checking token ${tokenId} for address ${address}:`, balance);
          
          if (balance && balance.gt(0)) {
            console.log("🎉 Found token ownership for address:", address);
            setAccessGranted(true);
            setSuccess(true);
            setError(null);
            cacheOwnership(address, true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.log(`Error checking token ${tokenId}:`, err);
          continue; // Continue checking other tokens
        }
      }

      // If we get here, no tokens were found
      console.log("❌ No tokens found for address:", address);
      setAccessGranted(false);
      setSuccess(false);
      setError("You do not own an NFT from this collection.");
      cacheOwnership(address, false);
      
    } catch (error) {
      console.error("Error checking holder status:", error);
      
      // Fallback to TzKT API
      try {
        const tzktResult = await checkNFTOwnershipTzKT(address);
        if (tzktResult) {
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
    const apiUrl = `https://ghostnet.tzkt.io/v1/tokens/balances?account=${address}&token.contract=${RuidoPerlaNFTContract}`;
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