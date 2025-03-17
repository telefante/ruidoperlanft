import React, { useRef, useState, useEffect } from "react"
import * as lighthouse from "@lighthouse-web3/sdk"
import html2canvas from "html2canvas"
import { Button, Container, Modal } from "react-bootstrap"
import { TezosToolkit, MichelsonMap } from "@taquito/taquito"
import { useWallet } from "./WalletContext"
import ipfsOnlyHash from "ipfs-only-hash"

const MintNFTProcess = ({ containerRef, perlinSettings, capturedImage }) => {
  const [uploading, setUploading] = useState(false)
  const [minting, setMinting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [ipfsUrl, setIpfsUrl] = useState(null)
  const [metadataUrl, setMetadataUrl] = useState(null)
  const [metadataJson, setMetadataJson] = useState(null)
  const [showMinting, setShowMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)

  const { isConnected, walletAddress, beaconWallet, tezos } = useWallet()
  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY
  const CONTRACT = process.env.GATSBY_TEZOS_REALTIME_CONTRACT

  // useEffect(() => {
  //   if (ipfsUrl) {
  //     console.log(
  //       `https://gateway.lighthouse.storage/ipfs/${ipfsUrl.split("ipfs://")[1]}`
  //     )
  //   }
  // }, [ipfsUrl])

  const startMintingProcess = async () => {
    console.log("🚀 Starting Minting Process...")
    setMinting(true) // Start minting process

    try {
      const imageIpfsUrl = await uploadImageToIPFS() // ✅ Wait for image upload

      if (!imageIpfsUrl) {
        console.error("❌ Image upload failed! Stopping mint process.")
        setMinting(false)
        return
      }

      await uploadMetadataToIPFS(imageIpfsUrl) // ✅ Proceed to metadata upload
    } catch (error) {
      console.error("❌ Error in minting process:", error)
      setMinting(false)
    }
  }

  useEffect(() => {
    if (metadataUrl && ipfsUrl && minting) {
      // Ensuring both URLs are available
      console.log("🚀 Both URLs are set. Initiating mint...")
      console.log(
        `
        Image Gateway https://gateway.lighthouse.storage/ipfs/${
          ipfsUrl.split("ipfs://")[1]
        }`
      )
      console.log(
        `Metadata Gateway https://gateway.lighthouse.storage/ipfs/${
          metadataUrl.split("ipfs://")[1]
        }`
      )
      mintNFT()
    }
  }, [metadataUrl, ipfsUrl, minting]) // Runs only when metadataUrl or ipfsUrl changes

  // useEffect(() => {
  //   if (!ipfsUrl) {
  //     uploadImageToIPFS();
  //   }
  // }, []);

  const uploadImageToIPFS = async () => {
    console.log("📤 Uploading Image to IPFS...")
    setUploading(true)

    try {
      if (!capturedImage) {
        throw new Error("No captured image provided")
      }

      const response = await fetch(capturedImage)
      const imageBlob = await response.blob()
      const file = new File([imageBlob], `RuidoPerla-${Date.now()}.png`, {
        type: "image/png",
      })

      const fileResponse = await lighthouse.upload([file], LIGHTHOUSE_API_KEY)
      if (fileResponse.data && fileResponse.data.Hash) {
        const imageCid = fileResponse.data.Hash
        const ipfsImageUrl = `ipfs://${imageCid}`
        setIpfsUrl(ipfsImageUrl)
        console.log(
          `✅ Image Uploaded: https://gateway.lighthouse.storage/ipfs/${ipfsImageUrl.split("ipfs://")[1]}`
        )

        return ipfsImageUrl // ✅ Return image URL for metadata upload
      } else {
        throw new Error("Image upload failed.")
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error)
      setMinting(false)
      return null
    } finally {
      setUploading(false)
    }
  }
  const uploadMetadataToIPFS = async (imageIpfsUrl) => {
    console.log("📤 Uploading Metadata to IPFS...");
    setUploading(true);
  
    try {
      const tokenId = Math.floor(Math.random() * 100000);
      const formattedTokenId = String(tokenId).padStart(3, "0");
      const currentDate = new Date().toISOString();
  
      const metadataJson = {
        date: currentDate,
        name: `RuidoPerla#${formattedTokenId}`,
        tags: ["Generative Art", "Algorithmic", "NFT", "Tezos"],
        minter: walletAddress,
        rights: "No License / All Rights Reserved",
        symbol: "RPNFT",
        formats: [
          { uri: imageIpfsUrl, mimeType: "image/png" },
          { uri: imageIpfsUrl.replace(".png", ".jpg"), mimeType: "image/jpeg" },
          { uri: imageIpfsUrl.replace(".png", ".gif"), mimeType: "image/gif" },
        ],
        creators: [walletAddress],
        decimals: "0",
        royalties: { shares: { [walletAddress]: 1000 }, decimals: 4 },
        attributes: [
          { name: "Amplitude", value: perlinSettings.amplitude.toString() },
          { name: "Scale", value: perlinSettings.scale.toString() },
          { name: "Frequency", value: perlinSettings.frequency.toString() },
          { name: "Octaves", value: perlinSettings.octaves.toString() },
          { name: "Entropy", value: (Math.random() * 10).toFixed(6) },
        ],
        displayUri: imageIpfsUrl.replace(".png", ".jpg"),
        artifactUri: imageIpfsUrl,
        description: `With Entropy ${(Math.random() * 10).toFixed(6)}, it balances on the edge of dissolution.`,
        mintingTool: "http://ruidoperlanft.netlify.com",
        thumbnailUri: imageIpfsUrl.replace(".png", ".jpg"),
      };
  
      const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], `RuidoPerla${formattedTokenId}.json`, {
        type: "application/json",
      });
  
      const metadataResponse = await lighthouse.upload([metadataFile], LIGHTHOUSE_API_KEY);
  
      if (metadataResponse.data && metadataResponse.data.Hash) {
        const metadataCid = metadataResponse.data.Hash;
        const IPFS_CID = `ipfs://${metadataCid}`;
  
        console.log("✅ Metadata Uploaded:", IPFS_CID);
  
        // ✅ Pass both URLs to mintNFT directly
        mintNFT(tokenId, IPFS_CID, imageIpfsUrl);
      } else {
        throw new Error("Metadata upload failed.");
      }
    } catch (error) {
      console.error("❌ Error uploading metadata:", error);
      setMinting(false);
    } finally {
      setUploading(false);
    }
  };
  const mintNFT = async (tokenId, metadataIpfsUrl, imageIpfsUrl) => {
    console.log("🚀 Minting NFT...");
  
    if (!isConnected || !walletAddress || !beaconWallet) {
      alert("Please connect your wallet first!");
      setMinting(false);
      return;
    }
  
    console.log("Metadata URL before minting:", metadataIpfsUrl);
    console.log("Image URL before minting:", imageIpfsUrl);
  
    if (!metadataIpfsUrl || !imageIpfsUrl) {
      alert("IPFS upload incomplete! Make sure both image and metadata are uploaded.");
      setMinting(false);
      return;
    }
  
    try {
      const contract = await tezos.wallet.at(CONTRACT);
      console.log("✅ Contract successfully fetched.");
  
      console.log("🔹 Corrected IPFS Metadata URI:", metadataIpfsUrl);
  
      // Create a MichelsonMap with the correct metadata format
      const metadata = new MichelsonMap();
      metadata.set("", Buffer.from(`${metadataIpfsUrl}`).toString("hex")); // Store as hex
  
      console.log("Metadata:", metadata);
  
      console.log("📤 Sending create_token transaction...");
      const createOp = await contract.methods.create_token(tokenId, metadata).send();
      await createOp.confirmation(1);
      console.log(`✅ Token ${tokenId} Created! TX: ${createOp.opHash}`);
  
      console.log("📤 Sending mint_tokens transaction...");
      const mintOp = await contract.methods
        .mint_tokens([{ owner: walletAddress, token_id: tokenId, amount: 1 }])
        .send();
      await mintOp.confirmation(1);
      console.log(`✅ NFT Minted to ${walletAddress}! TX: ${mintOp.opHash}`);
  
      setMintSuccess(true);
    } catch (error) {
      console.error("❌ Error minting NFT:", error);
      alert("Failed to mint NFT.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <Container>
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured Scene"
          style={{ width: "100%" }}
        />
      )}

      <pre style={{ backgroundColor: "#f8f9fa", padding: "10px" }}>
        {JSON.stringify(metadataJson, null, 2)}
      </pre>
      <p style={{ color: "black", fontSize: "12px" }}>
        <strong>Estimated Image CID:</strong> {ipfsUrl}
      </p>
      <p style={{ color: "black", fontSize: "12px" }}>
        <strong>Estimated Metadata CID:</strong> {metadataUrl}
      </p>

      <Button
        variant="primary"
        onClick={startMintingProcess}
        disabled={minting}
      >
        {minting ? "Minting..." : "Mint this!"}
      </Button>

      {mintSuccess && (
        <p style={{ color: "green" }}>✅ NFT Minted Successfully!</p>
      )}
    </Container>
  )
}

export default MintNFTProcess
