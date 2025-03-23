import React, { useRef, useState, useEffect } from "react"
import * as lighthouse from "@lighthouse-web3/sdk"
// import html2canvas from "html2canvas"
import { Button, Container, Row } from "react-bootstrap"
import { MichelsonMap } from "@taquito/taquito"
import { useWallet } from "./WalletContext"
import { color } from "framer-motion"
// import ipfsOnlyHash from "ipfs-only-hash"

const MintNFTProcess = ({ containerRef, perlinSettings, capturedImage, textFragment }) => {
  const [uploading, setUploading] = useState(false) // vielleicht nicht mehr nötig
  const [minting, setMinting] = useState(false)
  const [ipfsUrl, setIpfsUrl] = useState(null) // vielleicht nicht mehr nötig
  const [gatewayImageUrl, setGatewayImageUrl] = useState(null)
  const [gatewayMetadataUrl, setGatewayMetadataUrl] = useState(null)

  const [mintSuccess, setMintSuccess] = useState(false)
  const [isHolderOfRareOrLegendary, setIsHolderOfRareOrLegendary] = useState(false)
  const [currentSupply, setCurrentSupply] = useState(0)
  const [maxSupply, setMaxSupply] = useState(7)

  // Get wallet context
  const { 
    isConnected, 
    walletAddress, 
    beaconWallet, 
    tezos,
    connectWallet // Add this to allow connecting from the component
  } = useWallet()

  // Add loading state for wallet
  const [walletLoading, setWalletLoading] = useState(false)

  // Check wallet connection and supply when component mounts or wallet state changes
  useEffect(() => {
    const initializeWalletState = async () => {
      if (tezos && isConnected && walletAddress) {
        try {
          setWalletLoading(true)
          await checkHolderStatus()
          await checkSupply()
        } catch (error) {
          console.error("Error initializing wallet state:", error)
        } finally {
          setWalletLoading(false)
        }
      }
    }

    initializeWalletState()
  }, [isConnected, walletAddress, tezos])

  useEffect(() => {
    console.log("textFragment changed:", textFragment)
  }, [textFragment])

  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY
  const realtimeRPNFTContract = process.env.GATSBY_TEZOS_REALTIME_CONTRACT
  const FIRST_CREATOR = process.env.GATSBY_RPNNFT_CREATOR
  const AMOUNT = 2.5; // 2.5 TEZ
 
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
  const checkHolderStatus = async () => {
    try {
      const contract = await tezos.wallet.at(realtimeRPNFTContract)
      
      // Get balance of user's tokens
      const storage = await contract.storage()
      const userTokens = await storage.ledger.getKeys()
      
      // Check if user holds any tokens (you'll need to implement your own logic
      // to determine if they're rare/legendary based on your metadata)
      for (const tokenId of userTokens) {
        const tokenMetadata = await storage.token_metadata.get(tokenId)
        // Example check - modify based on your actual rarity criteria
        if (tokenMetadata && tokenMetadata.token_info.get('rarity') === 'rare' || 
            tokenMetadata.token_info.get('rarity') === 'legendary') {
          setIsHolderOfRareOrLegendary(true)
          break
        }
      }
    } catch (error) {
      console.error("Error checking holder status:", error)
    }
  }

  const checkSupply = async () => {
    try {
      const contract = await tezos.wallet.at(realtimeRPNFTContract)
      const storage = await contract.storage()
      const current = await storage.current_supply
      const max = await storage.max_supply
      
      setCurrentSupply(current.toNumber())
      setMaxSupply(max.toNumber())
    } catch (error) {
      console.error("Error checking supply:", error)
    }
  }

  const mintNFT = async (tokenId, metadataIpfsUrl, imageIpfsUrl) => {
    console.log("🚀 Minting NFT...")

    if (!isConnected || !walletAddress || !beaconWallet) {
      alert("Please connect your wallet first!")
      setMinting(false)
      return
    }

    if (!metadataIpfsUrl || !imageIpfsUrl) {
      alert("IPFS upload incomplete! Make sure both image and metadata are uploaded.")
      setMinting(false)
      return
    }

    try {
      const contract = await tezos.wallet.at(realtimeRPNFTContract)
      console.log("✅ Contract successfully fetched:", realtimeRPNFTContract)
      
      // Add this paragraph to show contract link
      const betterCallDevUrl = `https://better-call.dev/ghostnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/operations`;
      console.log(`View contract on Better Call Dev: ${betterCallDevUrl}`);

      // Create metadata map
      const metadataMap = new MichelsonMap()
      metadataMap.set("", Buffer.from(`${metadataIpfsUrl}`).toString("hex"))

      // Determine mint amount based on conditions
      let mintAmount = 0
      if (currentSupply < 3) {
        mintAmount = 0 // First 3 tokens are free
      } else if (isHolderOfRareOrLegendary) {
        mintAmount = 0 // Free for holders of rare/legendary
      } else {
        mintAmount = AMOUNT 
      }

      console.log("📤 Sending mint transaction...")
      const mintOp = await contract.methods
        .mint([{ metadata: metadataMap, to_: walletAddress }])
        .send({ amount: mintAmount });
      
      await mintOp.confirmation(1)
      
      // Add operation hash link
      const opHashUrl = `https://better-call.dev/ghostnet/opg/${mintOp.opHash}/contents`;
      console.log(`✅ NFT Minted! View transaction: ${opHashUrl}`);

      setMintSuccess({
        success: true,
        opHash: mintOp.opHash,
        opHashUrl: opHashUrl
      });
      
      // Update supply after successful mint
      checkSupply()
    } catch (error) {
      console.error("❌ Error minting NFT:", error)
      alert("Failed to mint NFT: " + error.message)
    } finally {
      setMinting(false)
    }
  }

  return (
    <Container>
      <style>
        {`
          p {
            color: black !important;
            font-size: 1rem;
            margin-bottom: 1rem;
          }
        `}
      </style>
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
      <p >
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
      <p >
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

      <div >
        {!isConnected ? (
          <Button
            variant="primary"
            onClick={connectWallet}
            disabled={walletLoading}
            style={{
              fontFamily: "var(--primary-font)",
              fontStyle: "italic",
              fontWeight: "bold",
              fontSize: "1.2rem",
              maxWidth: "200px",
            }}
          >
            Connect Wallet
          </Button>
        ) : (
          <>
            <div style={{ color: "black" }}>
              <p>Current Supply: {currentSupply} / {maxSupply}</p>
              <p>Minting Price: {
                currentSupply < 3 ? "Free (First 3 tokens)" :
                isHolderOfRareOrLegendary ? "Free (Rare/Legendary holder)" :
                `${AMOUNT} TEZ`
              }</p>
              <p>Connected Address: {walletAddress}</p>
            </div>
            <Button
              variant="primary"
              onClick={startMintingProcess}
              disabled={minting || currentSupply >= maxSupply || walletLoading}
              style={{
                fontFamily: "var(--primary-font)",
                fontStyle: "italic",
                fontWeight: "bold",
                fontSize: "1.2rem",
                maxWidth: "200px",
              }}
            >
              {walletLoading ? "Loading..." :
               minting ? "Minting..." : 
               currentSupply >= maxSupply ? "Max Supply Reached" : 
               "Mint this!"}
            </Button>
          </>
        )}
      </div>

      {mintSuccess && (
        <div>
          <p style={{ color: "green" }}>✅ NFT Minted Successfully!</p>
          {mintSuccess.opHash && (
            <p style={{ color: "black" }}>
              View transaction on Better Call Dev:{" "}
              <a 
                href={mintSuccess.opHashUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {mintSuccess.opHash}
              </a>
            </p>
          )}
        </div>
      )}
    </Container>
  )
}

export default MintNFTProcess
