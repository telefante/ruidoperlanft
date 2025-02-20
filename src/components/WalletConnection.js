import React, { useEffect, useState } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { useStaticQuery, graphql } from 'gatsby';
import { Button } from 'react-bootstrap';

const WalletConnection = ({ setAddress, setIsConnected, isConnected }) => {
  const [tezos, setTezos] = useState(null);
  const [wallet, setWallet] = useState(null);

  // Fetch RPC URL from site metadata
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          rpcUrl
        }
      }
    }
  `);
  const RPC_URL = data.site.siteMetadata.rpcUrl; // Get the RPC URL

  useEffect(() => {
    // Initialize Tezos toolkit and Beacon wallet
    const initTezos = async () => {
      const beaconWallet = new BeaconWallet({
        name: 'Ruido Perla NFTs',
        preferredNetwork: 'ghostnet',
      });

      const tezosInstance = new TezosToolkit(RPC_URL); // Use the fetched RPC URL
      tezosInstance.setWalletProvider(beaconWallet);

      setTezos(tezosInstance);
      setWallet(beaconWallet);
    };

    initTezos();
  }, [RPC_URL]); // Add RPC_URL as a dependency

  const connectWallet = async () => {
    if (!wallet) return;

    try {
      // Request permissions to connect the wallet
      await wallet.requestPermissions({
        network: {
          type: 'ghostnet',
          rpcUrl: RPC_URL, // Use the fetched RPC URL
        },
      });

      // Get the user's address
      const address = await wallet.getPKH();
      setAddress(address);
      setIsConnected(true);
      console.log('Connected wallet address:', address);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = async () => {
    if (!wallet) return;

    try {
      // Clear the wallet connection
      await wallet.clearActiveAccount(); // Clear the active account
      setAddress(null); // Reset the address
      setIsConnected(false); // Update connection status
      console.log('Disconnected wallet');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <Button
          style={{ fontFamily: 'var(--primary-font)', fontStyle: 'italic', fontSize: '1.2rem', marginLeft: '10px' }}
          variant="danger"
          onClick={disconnectWallet}
        >
          Disconnect Wallet
        </Button>
      ) : (
        <Button
          style={{ fontFamily: 'var(--primary-font)', fontStyle: 'italic', fontSize: '1.2rem' }}
          variant="primary"
          onClick={connectWallet}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;