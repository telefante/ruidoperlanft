import React, { createContext, useState, useEffect, useContext } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet";

const WalletContext = createContext();

const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [beaconWallet, setBeaconWallet] = useState(null);

  useEffect(() => {
    const initBeaconWallet = async () => {
      try {
        const wallet = new BeaconWallet({
          name: "Ruido Perla",
          preferredNetwork: "ghostnet",
        });
        setBeaconWallet(wallet);

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
  }, []);

  const connectWallet = async () => {
    if (!beaconWallet) {
      console.error("❌ Beacon Wallet instance is missing.");
      return;
    }

    try {
      await beaconWallet.requestPermissions({
        network: { type: "ghostnet" },
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