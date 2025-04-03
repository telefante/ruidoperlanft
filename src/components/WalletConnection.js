import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useWallet } from "./WalletContext"; // Import WalletContext
import { BeaconEvent } from "@taquito/beacon-wallet"; // Import BeaconEvent

const WalletConnection = () => {
  const { setWalletAddress, setIsConnected, isConnected, beaconWallet, tezos } = useWallet();

  // (Optional) If you still want to set the wallet provider here, ensure tezos is defined.
  useEffect(() => {
    if (tezos && beaconWallet) {
      tezos.setWalletProvider(beaconWallet);

      // Subscribe to the ACTIVE_ACCOUNT_SET event
      beaconWallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
        console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, account);
        if (account) {
          setWalletAddress(account.address);
          setIsConnected(true);
        } else {
          setWalletAddress(null);
          setIsConnected(false);
        }
      });
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
        network: { type: process.env.GATSBY_NETWORK_TYPE, rpcUrl: process.env.GATSBY_TEZOS_RPC_URL
          
         },
      });
      const address = await beaconWallet.getPKH();
      
      // Set wallet provider first
      if (tezos) {
        await tezos.setWalletProvider(beaconWallet);
      }
      
      // Update states together to ensure synchronous update
      await Promise.all([
        setWalletAddress(address),
        setIsConnected(true)
      ]);
      
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