import React, { useRef, useState, useEffect } from "react"
import * as lighthouse from "@lighthouse-web3/sdk"
// import html2canvas from "html2canvas"
import { Button, Container, Modal } from "react-bootstrap"
import { MichelsonMap } from "@taquito/taquito"
import { useWallet } from "./WalletContext"
// import ipfsOnlyHash from "ipfs-only-hash"

const MintNFTProcess = ({ containerRef, perlinSettings, capturedImage, textFragment }) => {
  const [uploading, setUploading] = useState(false)
  const [minting, setMinting] = useState(false)
  // const [showModal, setShowModal] = useState(false)
  const [ipfsUrl, setIpfsUrl] = useState(null)
  const [gatewayImageUrl, setGatewayImageUrl] = useState(null)
  const [gatewayMetadataUrl, setGatewayMetadataUrl] = useState(null)
  // const [metadataUrl, setMetadataUrl] = useState(null)
  // const [metadataJson, setMetadataJson] = useState(null)
  // const [showMinting, setShowMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
 
  useEffect(() => {
    console.log("textFragment changed:", textFragment)
  }, [textFragment])

  const { isConnected, walletAddress, beaconWallet, tezos } = useWallet()
  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY
  const realtimeRPNFTContract = process.env.GATSBY_TEZOS_REALTIME_CONTRACT
  const FIRST_CREATOR = process.env.GATSBY_RPNNFT_CREATOR

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
          `✅ Image Uploaded: https://gateway.lighthouse.storage/ipfs/${
            ipfsImageUrl.split("ipfs://")[1]
          }`
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
  const uploadMetadataToIPFS = async imageIpfsUrl => {
    console.log("📤 Uploading Metadata to IPFS...")
    setUploading(true)

    try {
      const tokenId = Math.floor(Math.random() * 100000)
      const formattedTokenId = String(tokenId).padStart(3, "0")
      const currentDate = new Date().toISOString()

      const metadataJson = {
        name: `RuidoPerla#${formattedTokenId}`,
        date: currentDate,
        tags: ["Generative Art", "Algorithmic", "Poetry", "Ruido Perla", "Poetics", "Real-Time"],
        minter: walletAddress,
        rights: "No License / All Rights Reserved",
        symbol: "RPNFT",
        creators:
          FIRST_CREATOR !== walletAddress
            ? [FIRST_CREATOR, walletAddress]
            : [walletAddress],
        decimals: "0",
        royalties: {
          shares:
            FIRST_CREATOR !== walletAddress
              ? { [walletAddress]: 500, [FIRST_CREATOR]: 500 }
              : { [walletAddress]: 1000 },
          decimals: 4,
        },
        attributes: [
          { name: "Amplitude", value: perlinSettings.amplitude.toString() },
          { name: "Scale", value: perlinSettings.scale.toString() },
          { name: "Frequency", value: perlinSettings.frequency.toString() },
          { name: "Octaves", value: perlinSettings.octaves.toString() },
          { name: "Text Fragment", value: textFragment },
        ],
        displayUri: imageIpfsUrl.replace(".png", ".jpg"),
        artifactUri: imageIpfsUrl,
        description: `You found a pearl in noise—Perlin noise, Ruido Perla. A landscape in flux, shifting with Amplitude ${perlinSettings.amplitude}, shaped by Scale ${perlinSettings.scale}, whispering in the frequencies of endless recombination. This NFT is not a static image—it is a key to a living simulation, evolving in real-time at ruidoperlanft.netlify.app. 
        A fragment of the infinite, seen once, then lost to the next wave.`,
        mintingTool: "https://ruidoperlanft.netlify.app",
        thumbnailUri: imageIpfsUrl.replace(".png", ".jpg"),
      }

      const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
        type: "application/json",
      })
      const metadataFile = new File(
        [metadataBlob],
        `RuidoPerla${formattedTokenId}.json`,
        {
          type: "application/json",
        }
      )

      const metadataResponse = await lighthouse.upload(
        [metadataFile],
        LIGHTHOUSE_API_KEY
      )

      if (metadataResponse.data && metadataResponse.data.Hash) {
        const metadataCid = metadataResponse.data.Hash;
        const IPFS_CID = `ipfs://${metadataCid}`;
      
        console.log("✅ Metadata Uploaded:", IPFS_CID);
      
        // ✅ Update state explicitly
        const newGatewayImageUrl = `https://gateway.lighthouse.storage/ipfs/${imageIpfsUrl.split("ipfs://")[1]}`;
        const newGatewayMetadataUrl = `https://gateway.lighthouse.storage/ipfs/${metadataCid}`;
      
        setGatewayImageUrl(newGatewayImageUrl);
        setGatewayMetadataUrl(newGatewayMetadataUrl);
      
        console.log("🚀 Updated State:");
        console.log("New Gateway Image URL:", newGatewayImageUrl);
        console.log("New Gateway Metadata URL:", newGatewayMetadataUrl);
      
        // ✅ Ensure state is updated before calling mintNFT
        setTimeout(() => {
          mintNFT(tokenId, IPFS_CID, imageIpfsUrl);
        }, 500); // Give React time to update state
      } else {
        throw new Error("Metadata upload failed.")
      }
    } catch (error) {
      console.error("❌ Error uploading metadata:", error)
      setMinting(false)
    } finally {
      setUploading(false)
    }
  }
  const mintNFT = async (tokenId, metadataIpfsUrl, imageIpfsUrl) => {
    console.log("🚀 Minting NFT...")

    if (!isConnected || !walletAddress || !beaconWallet) {
      alert("Please connect your wallet first!")
      setMinting(false)
      return
    }

    // console.log("Metadata URL before minting:", metadataIpfsUrl)
    // console.log("Image URL before minting:", imageIpfsUrl)

    if (!metadataIpfsUrl || !imageIpfsUrl) {
      alert(
        "IPFS upload incomplete! Make sure both image and metadata are uploaded."
      )
      setMinting(false)
      return
    }

    try {
      const contract = await tezos.wallet.at(realtimeRPNFTContract)
      console.log("✅ Contract successfully fetched:", realtimeRPNFTContract)
      console.log("🔹 Corrected IPFS Metadata URI:", metadataIpfsUrl)

      // Create a MichelsonMap with the correct metadata format
      const metadataMap = new MichelsonMap()
      metadataMap.set("", Buffer.from(`${metadataIpfsUrl}`).toString("hex")) // Store as hex

      console.log("Metadata:", metadataMap)

      // console.log("📤 Sending create_token transaction...")
      // const createOp = await contract.methods
      //   .create_token(tokenId, metadata)
      //   .send()
      // await createOp.confirmation(1)
      // console.log(`✅ Token ${tokenId} Created! TX: ${createOp.opHash}`)

      console.log("📤 Sending mint  transaction...")
      // const mintOp = await contract.methods
      //   .mint_tokens([{ owner: walletAddress, token_id: tokenId, amount: 1 }])
      //   .send()
      const mintOp = await contract.methods
        .mint([{ metadata: metadataMap, to_: walletAddress }])
        .send();
      await mintOp.confirmation(1)
      console.log(`✅ NFT Minted to ${walletAddress}! TX: ${mintOp.opHash}`)

      setMintSuccess(true)
    } catch (error) {
      console.error("❌ Error minting NFT:", error)
      alert("Failed to mint NFT.")
    } finally {
      setMinting(false)
    }
  }

  return (
    <Container>
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Captured Scene"
          style={{ width: "100%" }}
        />
      )}

      {/* <pre style={{ backgroundColor: "#f8f9fa", padding: "10px" }}>
        {JSON.stringify(metadataJson, null, 2)}
      </pre> */}
      <p style={{ color: "black", fontSize: "12px" }}>
        {gatewayImageUrl ? (
          <>
            <strong>
              <br />
              IPFS Image URL:{" "}
              <a
                href={gatewayImageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {gatewayImageUrl}
              </a>
            </strong>
            <br />
            {/* <img
              src={gatewayImageUrl}
              alt="NFT Preview"
              style={{ width: "200px", marginTop: "10px" }}
            /> */}
          </>
        ) : (
          <em>Waiting for image upload...</em>
        )}
      </p>
      <p style={{ color: "black", fontSize: "12px" }}>
        {gatewayMetadataUrl ? (
          <>
            <strong>
              <br />
              IPFS Metadata CID:{" "}
              <a
                href={gatewayMetadataUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {gatewayMetadataUrl}
              </a>
            </strong>
          </>
        ) : (
          <em>Waiting for metadata upload...</em>
        )}
      </p>

      <Button
        variant="primary"
        onClick={startMintingProcess}
        disabled={minting}
        style={{
          fontFamily: "var(--primary-font)",
          fontStyle: "italic",
          fontWeight: "bold",
          fontSize: "1.2rem",
          maxWidth: "200px",
        }}
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
