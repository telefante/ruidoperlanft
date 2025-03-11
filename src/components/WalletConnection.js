import React, { useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { Button } from "react-bootstrap";
import { useWallet } from "./WalletContext"; // Import WalletContext

const WalletConnection = () => {
  const { setWalletAddress, setIsConnected, isConnected, beaconWallet } =
    useWallet();

  const RPC_URL = "https://ghostnet.ecadinfra.com"; // Correct Tezos RPC URL
  // for mainnet https://mainnet.tezos.ecadinfra.com/
  const NETWORK_TYPE = process.env.GATSBY_NETWORK_TYPE; // Correct Tezos network type
  console.log("TYPE:", NETWORK_TYPE);
  const tezos = new TezosToolkit(RPC_URL);

  useEffect(() => {
    tezos.setWalletProvider(beaconWallet);
  }, [beaconWallet, tezos]);

  const connectWallet = async () => {
    console.log("🔄 Connecting wallet...");
    if (!beaconWallet) {
      console.error("❌ Beacon Wallet instance is missing.");
      return;
    }

    try {
      await beaconWallet.requestPermissions({
        network: { type: "ghostnet", rpcUrl: RPC_URL },
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