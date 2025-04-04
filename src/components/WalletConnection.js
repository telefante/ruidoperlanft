import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useWallet } from "./WalletContext"; // Import WalletContext
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";

const WalletConnection = () => {
  const { setWalletAddress, setIsConnected, isConnected, beaconWallet, setTezos } = useWallet();

  useEffect(() => {
    const tezos = new TezosToolkit(process.env.GATSBY_TEZOS_RPC_URL || "https://ghostnet.api.tez.ie");
    const wallet = new BeaconWallet({ name: "Ruido Perla Taquito" });

    // Set the wallet provider for Tezos
    tezos.setWalletProvider(wallet);
    // setTezos(tezos); // Store the Tezos instance in context

    // Check for an active account on component mount
    const checkActiveAccount = async () => {
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        console.log("Active account found:", activeAccount);
        setWalletAddress(activeAccount.address);
        setIsConnected(true);
      }
    };

    checkActiveAccount();
  }, [setWalletAddress, setIsConnected, setTezos]);

  const connectWallet = async () => {
    console.log("🔄 Connecting wallet...");
    if (!beaconWallet) {
      console.error("❌ Beacon Wallet instance is missing.");
      return;
    }

    try {
      await beaconWallet.requestPermissions({
        network: { type: process.env.GATSBY_NETWORK_TYPE, rpcUrl: process.env.GATSBY_TEZOS_RPC_URL },
      });
      const address = await beaconWallet.getPKH();
      console.log("✅ Wallet Connected:", address);
      setWalletAddress(address);
      setIsConnected(true);
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