import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useWallet } from "./WalletContext"; // Import WalletContext
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";

const WalletConnection = () => {
  const { setWalletAddress, setIsConnected, isConnected, beaconWallet, setTezos } = useWallet();

  useEffect(() => {
    const primaryRpc = process.env.GATSBY_TEZOS_RPC_URL;
    const backupRpc = process.env.GATSBY_TEZOS_RPC_URL_BACKUP;
    const networkType = process.env.GATSBY_NETWORK_TYPE;

    const initializeWallet = async () => {
      try {
        console.log("🔄 Initializing wallet with primary RPC:", primaryRpc);
        const tezos = new TezosToolkit(primaryRpc);
        const wallet = new BeaconWallet({
          name: "Ruido Perla Taquito",
          preferredNetwork: networkType,
          rpcUrl: primaryRpc,
        });

        tezos.setWalletProvider(wallet);
        setTezos(tezos);

        const activeAccount = await wallet.client.getActiveAccount();
        if (activeAccount) {
          console.log("✅ Active account found:", activeAccount);
          setWalletAddress(activeAccount.address);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("❌ Error initializing wallet with primary RPC:", error.message);

        try {
          console.log("🔄 Retrying with backup RPC:", backupRpc);
          const tezos = new TezosToolkit(backupRpc);
          const wallet = new BeaconWallet({
            name: "Ruido Perla Taquito",
            preferredNetwork: networkType,
            rpcUrl: backupRpc,
          });

          tezos.setWalletProvider(wallet);
          setTezos(tezos);

          const activeAccount = await wallet.client.getActiveAccount();
          if (activeAccount) {
            console.log("✅ Active account found (Backup):", activeAccount);
            setWalletAddress(activeAccount.address);
            setIsConnected(true);
          }
        } catch (backupError) {
          console.error("❌ Error initializing wallet with backup RPC:", backupError.message);
        }
      }
    };

    initializeWallet();
  }, [setWalletAddress, setIsConnected, setTezos]);

  const connectWallet = async () => {
    console.log("🔄 Connecting wallet...");
    if (!beaconWallet) {
      console.error("❌ Beacon Wallet instance is missing.");
      return;
    }

    try {
      const networkType = process.env.GATSBY_NETWORK_TYPE;
      const rpcUrl = process.env.GATSBY_TEZOS_RPC_URL;

      await beaconWallet.requestPermissions({
        network: { type: networkType, rpcUrl: rpcUrl },
      });
      const address = await beaconWallet.getPKH();
      console.log("✅ Wallet Connected:", address);
      setWalletAddress(address);
      setIsConnected(true);
      // Force a page refresh after wallet connection
      window.location.reload();
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
        <Button variant="danger" onClick={disconnectWallet} style={{ fontFamily: "var(--primary-font)", fontStyle: "italic" , fontWeight: "bold"}}>
          Disconnect Wallet
        </Button>
      ) : (
        <Button variant="primary" onClick={connectWallet} style={{ fontFamily: "var(--primary-font)", fontStyle: "italic" , fontWeight: "bold"}}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;