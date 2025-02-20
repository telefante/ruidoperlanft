import React, { useEffect, useState } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { useStaticQuery, graphql } from 'gatsby';
import { Button } from 'react-bootstrap';
import { useWallet } from './WalletContext'; // Import the WalletContext

const WalletConnection = () => {
  const { setWalletAddress, setIsConnected } = useWallet();
  const [wallet, setWallet] = useState(null);
  const [isConnected, setIsConnectedState] = useState(false);
  const RPC_URL = "https://ghostnet.tzkt.io/"; // Use your RPC URL

  useEffect(() => {
    const initTezos = async () => {
      const beaconWallet = new BeaconWallet({
        name: 'Ruido Perla NFTs',
        preferredNetwork: 'ghostnet',
      });

      const tezosInstance = new TezosToolkit(RPC_URL);
      tezosInstance.setWalletProvider(beaconWallet);

      setWallet(beaconWallet);
    };

    initTezos();
  }, []);

  const connectWallet = async () => {
    if (!wallet) return;

    try {
      await wallet.requestPermissions({
        network: {
          type: 'ghostnet',
          rpcUrl: RPC_URL,
        },
      });

      const address = await wallet.getPKH();
      setWalletAddress(address);
      setIsConnectedState(true);
      console.log('Connected wallet address:', address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = async () => {
    if (!wallet) return;

    try {
      await wallet.clearActiveAccount();
      setWalletAddress(null);
      setIsConnectedState(false);
      console.log('Disconnected wallet');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  return (
    <div>
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