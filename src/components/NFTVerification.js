import React, { useState, useEffect } from "react";
import { request, gql } from "graphql-request";
import { useWallet } from "./WalletContext";
import { Container, Row } from "react-bootstrap";

const objktapi =
  process.env.GATSBY_OBJKT_GRAPHQL_URL ||
  "https://data.ghostnet.objkt.com/v3/graphql";
const RuiperPerlacontractAddress = process.env.GATSBY_TEZOS_CONTRACT;
const CACHE_KEY = "nftOwnershipCache";
const CACHE_EXPIRY = 5 * 60 * 1000; // Cache for 5 minutes

const NFTVerification = ({ setAccessGranted }) => {
  const { walletAddress, isConnected, beaconWallet, setWalletAddress, setIsConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Ensure wallet state updates correctly
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!walletAddress || !isConnected) {
        console.log("🔄 Checking active wallet session...");
        const activeAccount = await beaconWallet?.client.getActiveAccount();
        if (activeAccount) {
          setWalletAddress(activeAccount.address);
          setIsConnected(true);
          console.log("✅ Auto-updated wallet connection:", activeAccount.address);
        }
      }
    };
    checkWalletConnection();
  }, [walletAddress, isConnected, beaconWallet, setWalletAddress, setIsConnected]);

  useEffect(() => {
    console.log("🟡 useEffect triggered in NFTVerification.");
    console.log("📌 Wallet Address:", walletAddress);
    console.log("📌 Wallet Connected:", isConnected);

    if (!walletAddress || !isConnected) {
      console.log("❌ No wallet connected. Denying access.");
      setAccessGranted(false);
      return;
    }

    verifyOwnership(walletAddress);
  }, [walletAddress, isConnected, setAccessGranted]);

  const verifyOwnership = async (address) => {
    console.log("🟡 Verifying NFT ownership for wallet:", address);
    setLoading(true);
    const cachedData = getCachedOwnership(address);

    if (cachedData !== null) {
      console.log("✅ Using cached NFT verification:", cachedData);
      setAccessGranted(cachedData);
      setSuccess(cachedData);
      setLoading(false);
      return;
    }

    try {
      console.log("📡 Checking TzKT API...");
      const ownsNFT = await checkNFTOwnershipTzKT(address);
      console.log("🔍 TzKT API Result:", ownsNFT);

      if (ownsNFT) {
        cacheOwnership(address, true);
        setAccessGranted(true);
        setSuccess(true);
        setLoading(false);
        return;
      }

      console.log("📡 Checking Objkt API...");
      const ownsNFTObjkt = await checkNFTOwnershipObjkt(address);
      console.log("🔍 Objkt API Result:", ownsNFTObjkt);

      if (ownsNFTObjkt) {
        cacheOwnership(address, true);
        setAccessGranted(true);
        setSuccess(true);
        setLoading(false);
        return;
      }

      console.log("❌ No NFTs found in either API.");
      cacheOwnership(address, false);
      setAccessGranted(false);
      setError("You do not own an NFT from this collection.");
    } catch (err) {
      console.error("⚠️ Error verifying NFT ownership:", err);
      setError("Failed to verify NFT ownership.");
    }
    setLoading(false);
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
    const apiUrl = `https://ghostnet.tzkt.io/v1/tokens/balances?account=${address}&token.contract=${RuiperPerlacontractAddress}`;
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
            token: { fa_contract: { _eq: "${RuiperPerlacontractAddress}" } }
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