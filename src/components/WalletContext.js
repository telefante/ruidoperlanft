import React, { createContext, useContext, useState, useEffect } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet"; // Ensure this is imported

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [beaconWallet, setBeaconWallet] = useState(new BeaconWallet({ name: "Ruido Perla NFTs" }));
  const [isConnected, setIsConnected] = useState(false);

  // Restore Wallet Connection on Page Load
  useEffect(() => {
    const restoreWallet = async () => {
      console.log("🔄 Checking for existing wallet connection...");
      try {
        const activeAccount = await beaconWallet.client.getActiveAccount();
        if (activeAccount) {
          console.log("✅ Restored Wallet:", activeAccount.address);
          setWalletAddress(activeAccount.address);
          setIsConnected(true);
        } else {
          console.log("⚠️ No active wallet session found.");
        }
      } catch (error) {
        console.error("❌ Error restoring wallet:", error);
      }
    };

    restoreWallet();
  }, []); // Run once when the component mounts

  useEffect(() => {
    console.log("🟡 WalletContext State Updated:", { walletAddress, isConnected });
  }, [walletAddress, isConnected]);

  return (
    <WalletContext.Provider value={{ walletAddress, setWalletAddress, beaconWallet, setBeaconWallet, isConnected, setIsConnected }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    console.error("🚨 WalletContext is missing! Ensure WalletProvider wraps the app.");
    return {
      walletAddress: null,
      setWalletAddress: () => {},
      beaconWallet: null,
      setBeaconWallet: () => {},
      isConnected: false,
      setIsConnected: () => {},
    };
  }

  console.log("🔄 WalletContext Updated in useWallet():", context);
  return context;
};