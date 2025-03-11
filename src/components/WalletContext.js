import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { BeaconWallet } from "@taquito/beacon-wallet"; // Ensure this is imported

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use useRef to hold the BeaconWallet instance
  const beaconWalletRef = useRef(null);

  // Initialize BeaconWallet only once after the component mounts
  useEffect(() => {
    beaconWalletRef.current = new BeaconWallet({
      name: "Ruido Perla NFTs",
      preferredNetwork: "ghostnet", // Set the correct network here
    });
  }, []); // Empty dependency array ensures this runs only once

  // Access the BeaconWallet instance through the ref
  const beaconWallet = beaconWalletRef.current;

  // Restore Wallet Connection on Page Load
  useEffect(() => {
    const restoreWallet = async () => {
      console.log("🔄 Checking for existing wallet connection...");
      try {
        // Ensure beaconWallet is initialized before using it
        if (beaconWallet) {
          const activeAccount = await beaconWallet.client.getActiveAccount();
          if (activeAccount) {
            console.log("✅ Restored Wallet:", activeAccount.address);
            setWalletAddress(activeAccount.address);
            setIsConnected(true);
          } else {
            console.log("⚠️ No active wallet session found.");
          }
        } else {
          console.warn("BeaconWallet not yet initialized.");
        }
      } catch (error) {
        console.error("❌ Error restoring wallet:", error);
        // Consider *not* resetting the state here, or logging more details
        // setWalletAddress(null);
        // setIsConnected(false);
      }
    };

    restoreWallet();
  }, []); // Removed beaconWallet from dependency array

  useEffect(() => {
    console.log("🟡 WalletContext State Updated:", {
      walletAddress,
      isConnected,
    });
  }, [walletAddress, isConnected]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        beaconWallet,
        isConnected,
        setIsConnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    console.error(
      "🚨 WalletContext is missing! Ensure WalletProvider wraps the app."
    );
    return {
      walletAddress: null,
      setWalletAddress: () => {},
      beaconWallet: null,
      isConnected: false,
      setIsConnected: () => {},
    };
  }

  // console.log("🔄 WalletContext Updated in useWallet():", context);
  return context;
};