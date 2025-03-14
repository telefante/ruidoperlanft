import React, { useState } from "react";
import { TezosToolkit, MichelsonMap } from "@taquito/taquito";
import { useWallet } from "./WalletContext";
import { Button, Container, Modal } from "react-bootstrap";

const MintNFTFromIPFS = ({ metadataCid }) => {
  const [minting, setMinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // Preview modal state
  const { walletAddress, isConnected, beaconWallet } = useWallet();
  
  const RPC_URL = "https://rpc.tzkt.io/ghostnet"; // Update for mainnet if needed
  const CONTRACT_ADDRESS = "KT1BjvQ6LQD16FLzb9Snz9TSVbdGUDXkfjq5"; // Your contract address

  const mintNFT = async () => {
    setShowPreview(false); // Close preview before minting

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
      const Tezos = new TezosToolkit(RPC_URL);
      await Tezos.setWalletProvider(beaconWallet);

      const contract = await Tezos.contract.at(CONTRACT_ADDRESS);
      const tokenId = Math.floor(Math.random() * 100000); // Unique Token ID

      const metadata = new MichelsonMap();
      metadata.set("", Buffer.from(`ipfs://${metadataCid}`).toString("hex"));

      console.log(`🔹 Creating NFT Token with Metadata: ipfs://${metadataCid}`);

      // ✅ Step 1: Create Token
      const createOp = await contract.methods.create_token(tokenId, metadata).send();
      await createOp.confirmation(1);
      console.log(`✅ Token ${tokenId} Created! TX: ${createOp.hash}`);

      // ✅ Step 2: Mint NFT to Wallet Address
      const mintOp = await contract.methods
        .mint_tokens([{ owner: walletAddress, token_id: tokenId, amount: 1 }])
        .send();
      await mintOp.confirmation(1);
      console.log(`✅ NFT Minted to ${walletAddress}! TX: ${mintOp.hash}`);

      alert(`NFT Minted Successfully! TX: ${mintOp.hash}`);
    } catch (error) {
      console.error("❌ Error minting NFT:", error);
      alert("Failed to mint NFT. Check console.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <Container>
      <h3 style={{ color: "white" }}>Mint NFT from IPFS</h3>
      {isConnected ? (
        <>
          <Button variant="primary" onClick={() => setShowPreview(true)} disabled={minting}>
            {minting ? "Minting..." : "Preview & Mint"}
          </Button>
        </>
      ) : (
        <p>Please connect your wallet to mint an NFT.</p>
      )}

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Minting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Metadata CID:</strong> {metadataCid}</p>
          <p><strong>Minting to Wallet:</strong> {walletAddress}</p>
          <p>You are about to mint an NFT with the metadata stored on IPFS.</p>
          <p>Do you want to proceed?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={mintNFT} disabled={minting}>
            {minting ? "Minting..." : "Confirm & Mint"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MintNFTFromIPFS;