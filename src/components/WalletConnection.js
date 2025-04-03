import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useWallet } from "./WalletContext"; // Import WalletContext

const WalletConnection = () => {
  const { setWalletAddress, setIsConnected, isConnected, beaconWallet, tezos } = useWallet();

  // (Optional) If you still want to set the wallet provider here, ensure tezos is defined.
  useEffect(() => {
    if (tezos && beaconWallet) {
      tezos.setWalletProvider(beaconWallet);
    }
  }, [tezos, beaconWallet]);

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
  
      // Reconfigure the Tezos instance with the connected wallet
      tezos.setWalletProvider(beaconWallet);
      console.log("Tezos signer:", tezos.signer);
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
        <Button variant="danger" style={{ fontFamily: "var(--primary-font)" }} onClick={disconnectWallet}>
          Disconnect Wallet
        </Button>
      ) : (
        <Button variant="primary" style={{ fontFamily: "var(--primary-font)" }} onClick={connectWallet}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;