// WalletContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";

const RPC_URL = process.env.NODE_ENV === "development" 
  ? "https://ghostnet.api.tez.ie" 
  : process.env.GATSBY_TEZOS_RPC_URL || "https://rpc.tzkt.io/ghostnet";

const preferedNetworkType = process.env.NODE_ENV === "development" 
  ? "ghostnet" 
  : process.env.GATSBY_NETWORK_TYPE || "ghostnet";

const WalletContext = createContext();

const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [beaconWallet, setBeaconWallet] = useState(null);
  const [tezos, setTezos] = useState(null);

  // Create TezosToolkit instance on component mount
  useEffect(() => {
    const tezosToolkit = new TezosToolkit(RPC_URL);
    setTezos(tezosToolkit);
  }, []);

  useEffect(() => {
    const initBeaconWallet = async () => {
      try {
        const wallet = new BeaconWallet({
          name: "Ruido Perla",
          preferredNetwork: preferedNetworkType,
          rpcUrl: RPC_URL,
        });
        setBeaconWallet(wallet);

        // Once TezosToolkit is available, configure it with the wallet provider
        if (tezos) {
          tezos.setWalletProvider(wallet);
        }

        // Fetch active wallet session if available
        const activeAccount = await wallet.client.getActiveAccount();
        if (activeAccount) {
          setWalletAddress(activeAccount.address);
          setIsConnected(true);
          console.log("✅ Auto-connected to Wallet:", activeAccount.address);
        }
      } catch (error) {
        console.error("❌ Error initializing BeaconWallet:", error);
      }
    };

    initBeaconWallet();
  }, [tezos]);

  const connectWallet = async () => {
    if (!beaconWallet) {
      console.error("❌ Beacon Wallet instance is missing.");
      return;
    }
    try {
      await beaconWallet.requestPermissions({
        network: { type: process.env.GATSBY_NETWORK_TYPE, rpcUrl: RPC_URL },
      });
      const address = await beaconWallet.getPKH();
      setWalletAddress(address);
      setIsConnected(true);
      console.log("✅ Wallet Connected:", address);
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
    }
  };

  const disconnectWallet = async () => {
    if (!beaconWallet) return;
    try {
      await beaconWallet.clearActiveAccount();
      setWalletAddress(null);
      setIsConnected(false);
      console.log("✅ Wallet Disconnected");
    } catch (error) {
      console.error("❌ Wallet disconnection failed:", error);
    }
  };

  const value = {
    walletAddress,
    setWalletAddress,
    isConnected,
    setIsConnected,
    beaconWallet,
    tezos, // share the TezosToolkit instance
    connectWallet,
    disconnectWallet,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export { WalletProvider, useWallet };