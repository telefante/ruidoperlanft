import React, { createContext, useState, useEffect, useContext } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet";

const WalletContext = createContext();

const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [beaconWallet, setBeaconWallet] = useState(null); // Initialize as null

  useEffect(() => {
    const initBeaconWallet = async () => {
      const wallet = new BeaconWallet({
        name: "Ruido Perla",
        preferredNetwork: "ghostnet",
      });
      setBeaconWallet(wallet);
    };

    initBeaconWallet();
  }, []);

  const value = {
    walletAddress,
    setWalletAddress,
    isConnected,
    setIsConnected,
    beaconWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export { WalletProvider, useWallet };