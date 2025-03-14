import React, { useState } from "react";
import { TezosToolkit, MichelsonMap } from "@taquito/taquito";
import { useWallet } from "./WalletContext";
import { Button, Container, Modal } from "react-bootstrap";

const MintNFTFromIPFS = ({ metadataCid }) => {
    const [minting, setMinting] = useState(false);
    const { walletAddress, isConnected, beaconWallet } = useWallet();
  const CONTRACT = process.env.GATSBY_TEZOS_REALTIME_CONTRACT;

  const mintNFT = async () => {
    if (!isConnected || !walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!metadataCid) {
      alert("Metadata CID is missing!");
      return;
    }
  
    setMinting(true);
  
    try {
      const Tezos = new TezosToolkit("https://rpc.tzkt.io/ghostnet");
  
      // Ensure wallet is properly set up
      const activeAccount = await beaconWallet.client.getActiveAccount();
      if (!activeAccount) {
        await beaconWallet.requestPermissions({ network: { type: "ghostnet" } });
      }
  
      Tezos.setProvider({ wallet: beaconWallet });
  
      // Load contract
      const contract = await Tezos.contract.at(CONTRACT);
  
      // Generate token ID
      const tokenId = Math.floor(Math.random() * 100000);
      const metadata = new MichelsonMap();
      metadata.set("", Buffer.from(`ipfs://${metadataCid}`).toString("hex"));
  
      console.log(`🔹 Creating NFT with Metadata: ipfs://${metadataCid}`);
  
      // Step 1: Create Token
      const createOp = await contract.methods.create_token(tokenId, metadata).send();
      await createOp.confirmation(1);
      console.log(`✅ Token ${tokenId} Created! TX: ${createOp.hash}`);
  
      // Step 2: Mint NFT
      const mintOp = await contract.methods
        .mint_tokens([{ owner: walletAddress, token_id: tokenId, amount: 1 }])
        .send();
      await mintOp.confirmation(1);
      console.log(`✅ NFT Minted to ${walletAddress}! TX: ${mintOp.hash}`);
  
      alert(`NFT Minted Successfully! TX: ${mintOp.hash}`);
    } catch (error) {
      console.error("❌ Error minting NFT:", error);
      alert("Failed to mint NFT.");
    } finally {
      setMinting(false);
    }
  };
  
    return (
      <Container>
        <h3>Mint NFT from IPFS</h3>
        <p><strong>Metadata CID:</strong> {metadataCid}</p>
        <p><strong>Minting to Wallet:</strong> {walletAddress}</p>
        <Button variant="primary" onClick={mintNFT} disabled={minting}>
          {minting ? "Minting..." : "Confirm & Mint"}
        </Button>
      </Container>
    );
  };

export default MintNFTFromIPFS;