import React, { useEffect, useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Button } from "react-bootstrap";
import { useWallet } from "./WalletContext"; // Import WalletContext

const WalletConnection = () => {
  const { setWalletAddress, setIsConnected, isConnected, beaconWallet, setBeaconWallet } = useWallet();
  const [wallet, setWallet] = useState(null);

  const RPC_URL = "https://ghostnet.ecadinfra.com"; // Correct Tezos RPC URL
  // for mainnet https://mainnet.tezos.ecadinfra.com/
  const TYPE = process.env.GATSBY_NETWORK_TYPE; // Correct Tezos network type
 
  const tezos = new TezosToolkit(RPC_URL);

  useEffect(() => {
    const initTezos = async () => {
      const walletInstance = new BeaconWallet({
        name: "Ruido Perla NFTs",
        preferredNetwork: "ghostnet",
      });

      tezos.setWalletProvider(walletInstance);
      setWallet(walletInstance); // Store local instance
      setBeaconWallet(walletInstance); // Store in global context

      const activeAccount = await walletInstance.client.getActiveAccount();
      if (activeAccount) {
        setWalletAddress(activeAccount.address);
        setIsConnected(true);
      }
    };

    initTezos();
  }, []);

  const connectWallet = async () => {
    console.log("🔄 Connecting wallet...");
    if (!beaconWallet) {
        console.error("❌ Beacon Wallet instance is missing.");
        return;
    }

    try {
        await beaconWallet.requestPermissions({
            network: { type: TYPE, rpcUrl: RPC_URL },
        });

        const address = await beaconWallet.getPKH();
        console.log("✅ Wallet Connected:", address);
        
        setWalletAddress(address); // 🚀 Ensure Context Updates
        setIsConnected(true);
        
        console.log("🔄 WalletContext Updated in WalletConnection.js", {
            address,
            isConnected: true,
        });
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
      console.log("✅ Disconnected wallet");
    } catch (error) {
      console.error("❌ Wallet disconnection failed:", error);
    }
  };

  useEffect(() => {
    console.log("isConnected:", isConnected);
  }, [isConnected]);

  return (
    <div className="wallet-connection">
      {isConnected ? (
        <Button variant="danger" onClick={disconnectWallet}>
          Disconnect Wallet
        </Button>
      ) : (
        <Button variant="primary" onClick={connectWallet}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;