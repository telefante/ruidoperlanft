import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [beaconWallet, setBeaconWallet] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  return (
    <WalletContext.Provider value={{ walletAddress, setWalletAddress, beaconWallet, setBeaconWallet, isConnected, setIsConnected }}>
    {children}
  </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const { walletAddress, setWalletAddress, beaconWallet, setBeaconWallet, isConnected, setIsConnected } = useContext(WalletContext);
  
  // console.log("Wallet Address:", walletAddress);
  // console.log("Beacon Wallet:", beaconWallet);

  return { walletAddress, setWalletAddress, beaconWallet, setBeaconWallet, isConnected, setIsConnected };
};