import React, { useState, useRef } from "react";
import * as lighthouse from "@lighthouse-web3/sdk";
import html2canvas from "html2canvas";
import { Button, Form, Container } from "react-bootstrap";
import { useWallet } from "./WalletContext"; // Import wallet context hook
import { TezosToolkit } from "@taquito/taquito";

const WalletMintNFT = ({ containerRef }) => {
  const captureRef = useRef(null);
  const [name, setName] = useState("RuidoPerla_Now");
  const [description, setDescription] = useState(
    "This is a real-time generated NFT from the Perlin Noise algorithm."
  );
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const [metadataUrl, setMetadataUrl] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  // Wallet Context Hook
  const { isConnected, walletAddress, connectWallet, getSigner } = useWallet(); 

  // Tezos Contract Configuration
  const TEZOS_RPC = process.env.GATSBY_TEZOS_RPC;
  const TEZOS_CONTRACT = process.env.GATSBY_TEZOS_CONTRACT;
  const Tezos = new TezosToolkit(TEZOS_RPC);

  const getLighthouseAuthToken = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const message = "Authenticate upload to Lighthouse with Tezos wallet";
      const signedMessage = await getSigner().sign(message);

      console.log("✅ Signed Message:", signedMessage);

      const response = await lighthouse.getAuthMessage(walletAddress, signedMessage);
      return response.data.token;
    } catch (error) {
      console.error("❌ Authentication Error:", error);
    }
  };

  const captureAndUpload = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!containerRef.current) {
      alert("No content detected for capture.");
      return;
    }

    setUploading(true);

    try {
      // 📸 Capture Screenshot
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 1,
      });

      // Convert to Blob & Upload to IPFS
      const imageBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      const timestamp = new Date().toISOString();
      const file = new File([imageBlob], `${name}-${timestamp}.png`, {
        type: "image/png",
      });

      // Authenticate with Lighthouse
      const authToken = await getLighthouseAuthToken();
      if (!authToken) throw new Error("Failed to get Lighthouse authentication token");

      // Upload Image to IPFS
      const fileResponse = await lighthouse.upload([file], authToken);
      const imageCid = fileResponse.data.Hash;
      const imageIpfsUrl = `ipfs://${imageCid}`;
      setIpfsUrl(imageIpfsUrl);

      console.log("✅ Image Uploaded to IPFS:", imageIpfsUrl);

      // 🎲 Generate Metadata JSON
      const metadataJson = {
        name,
        description: `${description} (Generated: ${timestamp})`,
        entropie: Math.random().toFixed(6),
        image: imageIpfsUrl,
      };

      // Upload Metadata JSON to IPFS
      const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });

      const metadataResponse = await lighthouse.upload([metadataFile], authToken);
      const metadataCid = metadataResponse.data.Hash;
      const metadataIpfsUrl = `ipfs://${metadataCid}`;
      setMetadataUrl(metadataIpfsUrl);

      console.log("✅ Metadata Uploaded to IPFS:", metadataIpfsUrl);

      // 🛠️ Mint the NFT
      await mintNFT(metadataIpfsUrl);
    } catch (error) {
      console.error("❌ Upload Failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const mintNFT = async (metadataIpfsUrl) => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    setMinting(true);

    try {
      Tezos.setWalletProvider(await getSigner());
      const contract = await Tezos.contract.at(TEZOS_CONTRACT);

      // 🛠️ Minting Parameters
      const tokenId = Math.floor(Math.random() * 100000);
      const mintParams = [
        {
          owner: walletAddress,
          token_id: tokenId,
          amount: 1,
          token_info: {
            name: "Generated NFT",
            description,
            entropie: Math.random().toFixed(6),
            image: metadataIpfsUrl,
          },
        },
      ];

      // 📌 Send Minting Transaction
      const op = await contract.methods.mint_tokens(mintParams).send();
      await op.confirmation();
      setTransactionHash(op.hash);

      console.log("✅ NFT Minted on Tezos! Tx Hash:", op.hash);
    } catch (error) {
      console.error("❌ Minting Error:", error);
    } finally {
      setMinting(false);
    }
  };

  return (
    <Container>
      {isConnected ? (
        <Form style={{ padding: "10px", textAlign: "center" }}>
          <Button
            variant="primary"
            onClick={captureAndUpload}
            disabled={uploading || minting}
          >
            {uploading ? "Uploading..." : minting ? "Minting..." : "Capture, Upload & Mint"}
          </Button>

          {/* Editable NFT Name & Description */}
          <Form.Group controlId="nft-name">
            <Form.Label>NFT Name</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="nft-description">
            <Form.Label>NFT Description</Form.Label>
            <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Form.Group>

          {transactionHash && (
            <p>
              🎉 <a href={`https://ghostnet.tzkt.io/${transactionHash}`} target="_blank" rel="noopener noreferrer">View NFT on Tezos</a>
            </p>
          )}
        </Form>
      ) : (
        <p>Please connect your wallet to upload and mint.</p>
      )}
    </Container>
  );
};

export default WalletMintNFT;