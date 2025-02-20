import React, { useEffect, useState } from 'react';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

const WalletConnection = ({ setAddress, setIsConnected }) => {
  const [tezos, setTezos] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    // Initialize Tezos toolkit and Beacon wallet
    const initTezos = async () => {
      const beaconWallet = new BeaconWallet({
        name: 'Your DApp Name',
        preferredNetwork: 'ghostnet',
      });

      const tezosInstance = new TezosToolkit('https://ghostnet.api.tez.ie');
      tezosInstance.setWalletProvider(beaconWallet);

      setTezos(tezosInstance);
      setWallet(beaconWallet);
    };

    initTezos();
  }, []);

  const connectWallet = async () => {
    if (!wallet) return;

    try {
      // Request permissions to connect the wallet
      await wallet.requestPermissions({
        network: {
          type: 'ghostnet',
          rpcUrl: 'https://ghostnet.api.tez.ie',
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

  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
  );
};

export default WalletConnection;