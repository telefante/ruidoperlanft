import React, { useRef, useState, useEffect } from "react"
import * as lighthouse from "@lighthouse-web3/sdk"
// import html2canvas from "html2canvas"
import { Button, Container, Row, Col } from "react-bootstrap"
import { MichelsonMap } from "@taquito/taquito"
import { useWallet } from "./WalletContext"
import { color } from "framer-motion"
// import ipfsOnlyHash from "ipfs-only-hash"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

const MintNFTProcess = ({
  containerRef,
  perlinSettings,
  capturedImage,
  textFragment,
}) => {
  const [uploading, setUploading] = useState(false) // vielleicht nicht mehr nötig
  const [minting, setMinting] = useState(false)
  const [ipfsUrl, setIpfsUrl] = useState(null) // vielleicht nicht mehr nötig
  const [gatewayImageUrl, setGatewayImageUrl] = useState(null)
  const [gatewayMetadataUrl, setGatewayMetadataUrl] = useState(null)

  const [mintSuccess, setMintSuccess] = useState(false)
  const [currentSupply, setCurrentSupply] = useState(0)
  const [maxSupply, setMaxSupply] = useState(7)
  const [holderStatus, setHolderStatus] = useState(null) // null: not checked, true: is holder, false: not holder
  const [highestRarity, setHighestRarity] = useState(null) // 'Legendary', 'Rare', 'Common', or null
  const [imageMinted, setImageMinted] = useState(false) // New state to track if image has been minted

  // Get wallet context
  const {
    isConnected,
    walletAddress,
    beaconWallet,
    tezos,
    connectWallet,
  } = useWallet()

  // Add loading state for wallet
  const [walletLoading, setWalletLoading] = useState(false)

  // Check wallet connection and supply when component mounts or wallet state changes
  useEffect(() => {
    const initializeWalletState = async () => {
      if (isBrowser && tezos && isConnected && walletAddress) {
        try {
          setWalletLoading(true)
          await checkSupply()
          await checkHolderStatus()
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
  const PreMintedRPNCollection= process.env.GATSBY_RUIDOPERLANFT_CONTRACT

  // console.log("🔍 Contract Addresses:", {
  //   realtimeRPNFTContract,
  //   PreMintedRPNCollection,
  //   FIRST_CREATOR
  // })

  const TIER1_LIMIT = 10 // First 8 tokens
  const TIER2_LIMIT = 15 // Next 2 tokens (tokens 9-10)
  const TIER3_LIMIT = 16 // Last 2 tokens (tokens 11-12)
  
  const TIER1_PRICE = 2 // 2 TEZ
  const TIER2_PRICE = 4 // 4 TEZ
  const TIER3_PRICE = 10 // 10 TEZ

  const getMintPrice = () => {
    if (currentSupply >= TIER2_LIMIT) {
      return TIER3_PRICE
    } else if (currentSupply >= TIER1_LIMIT) {
      return TIER2_PRICE
    } else {
      return TIER1_PRICE
    }
  }

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
        tags: [
          "Generative Art",
          "Algorithmic",
          "Poetry",
          "Ruido Perla",
          "Poetics",
          "Real-Time",
        ],
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
        const metadataCid = metadataResponse.data.Hash
        const IPFS_CID = `ipfs://${metadataCid}`

        console.log("✅ Metadata Uploaded:", IPFS_CID)

        // ✅ Update state explicitly
        const newGatewayImageUrl = `https://gateway.lighthouse.storage/ipfs/${
          imageIpfsUrl.split("ipfs://")[1]
        }`
        const newGatewayMetadataUrl = `https://gateway.lighthouse.storage/ipfs/${metadataCid}`

        setGatewayImageUrl(newGatewayImageUrl)
        setGatewayMetadataUrl(newGatewayMetadataUrl)

        console.log("🚀 Updated State:")
        console.log("New Gateway Image URL:", newGatewayImageUrl)
        console.log("New Gateway Metadata URL:", newGatewayMetadataUrl)

        // ✅ Ensure state is updated before calling mintNFT
        setTimeout(() => {
          mintNFT(tokenId, IPFS_CID, imageIpfsUrl)
        }, 500) // Give React time to update state
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

  const checkSupply = async () => {
    if (!isBrowser) return

    try {
      console.log("📊 Checking supply for contract:", realtimeRPNFTContract)
      const contract = await tezos.wallet.at(realtimeRPNFTContract)
      const storage = await contract.storage()
      
      console.log("📦 Contract Storage:", storage)
      
      const current = await storage.current_supply
      const max = await storage.max_supply

      console.log("📈 Supply Info:", {
        current: current.toNumber(),
        max: max.toNumber(),
        contract: realtimeRPNFTContract,
        rawCurrent: current,
        rawMax: max
      })

      setMaxSupply(max.toNumber())
      setCurrentSupply(current.toNumber())
    } catch (error) {
      console.error("Error checking supply:", error)
      console.error("Contract address:", realtimeRPNFTContract)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      })
    }
  }

  const checkHolderStatus = async () => {
    if (!isBrowser) return

    try {
      const contract = await tezos.wallet.at(PreMintedRPNCollection)
      const storage = await contract.storage()
      const ledger = await storage.assets.ledger
      const tokenMetadata = await storage.assets.token_metadata

      // Get all token IDs from metadata (usually 0 to total supply - 1)
      const tokenIds = Array.from({ length: 10 }, (_, i) => i); // Check first 10 tokens

      // Get all token IDs owned by the user
      const userTokens = []
      for (const tokenId of tokenIds) {
        try {
          // Create the key for the ledger big map
          const key = { 0: walletAddress, 1: tokenId }
          
          // Check if this address owns this token
          const balance = await ledger.get(key)
          if (balance && balance.gt(0)) {
            userTokens.push(tokenId)
          }
        } catch (err) {
          console.log(`Error checking token ${tokenId}:`, err)
          continue // Continue checking other tokens
        }
      }

      // Check if user has any tokens
      const isHolder = userTokens.length > 0
      setHolderStatus(isHolder)

      if (isHolder) {
        // Check rarity of user's tokens
        let highestRarityFound = 'Common'
        for (const tokenId of userTokens) {
          const metadata = await tokenMetadata.get(tokenId)
          if (metadata) {
            const attributes = metadata.extra
            if (attributes) {
              const rarity = attributes.find(attr => attr.name === "Rarity")
              if (rarity) {
                if (rarity.value === "Legendary") {
                  highestRarityFound = "Legendary"
                  break
                } else if (rarity.value === "Rare" && highestRarityFound === "Common") {
                  highestRarityFound = "Rare"
                }
              }
            }
          }
        }
        setHighestRarity(highestRarityFound)
        console.log("Holder status:", isHolder, "Highest rarity:", highestRarityFound)
      } else {
        setHighestRarity(null)
        console.log("Not a holder")
      }
    } catch (error) {
      console.error("Error checking holder status:", error)
      setHolderStatus(false)
      setHighestRarity(null)
    }
  }

  const mintNFT = async (tokenId, metadataIpfsUrl, imageIpfsUrl) => {
    if (!isBrowser) return

    console.log("🚀 Minting NFT...")

    if (!isConnected || !walletAddress || !beaconWallet) {
      alert("Please connect your wallet first!")
      setMinting(false)
      return
    }

    if (!holderStatus) {
      alert("You need to own at least one NFT from the collection to mint!")
      setMinting(false)
      return
    }

    if (!metadataIpfsUrl || !imageIpfsUrl) {
      alert(
        "IPFS upload incomplete! Make sure both image and metadata are uploaded."
      )
      setMinting(false)
      return
    }

    if (imageMinted) {
      alert("This image has already been minted!")
      setMinting(false)
      return
    }

    try {
      const contract = await tezos.wallet.at(realtimeRPNFTContract)
      console.log("✅ Contract successfully fetched:", realtimeRPNFTContract)

      // Create metadata map
      const metadataMap = new MichelsonMap()
      metadataMap.set("", Buffer.from(`${metadataIpfsUrl}`).toString("hex"))

      // Get mint price based on current supply
      const mintAmount = getMintPrice()

      console.log("📤 Sending mint transaction with amount:", {
        tez: mintAmount,
        mutez: mintAmount * 1000000,
        currentSupply,
        tier: currentSupply >= TIER2_LIMIT ? "Tier 3" : 
              currentSupply >= TIER1_LIMIT ? "Tier 2" : "Tier 1"
      })

      const mintOp = await contract.methods
        .mint([{ metadata: metadataMap, to_: walletAddress }])
        .send({
          amount: mintAmount,
          mutez: false,
          storageLimit: 1000,
          gasLimit: 10000,
        })

      await mintOp.confirmation(1)

      // Add operation hash link
      const opHashUrl = `https://better-call.dev/ghostnet/opg/${mintOp.opHash}/contents`
      console.log(`✅ NFT Minted! View transaction: ${opHashUrl}`)

      setMintSuccess({
        success: true,
        opHash: mintOp.opHash,
        opHashUrl: opHashUrl,
      })

      // Update supply after successful mint
      checkSupply()
      setImageMinted(true) // Mark this image as minted
    } catch (error) {
      console.error("❌ Error minting NFT:", error)
      if (error.message.includes("Deprecated")) {
        alert("The contract is currently being updated. Please try again in a few minutes.")
      } else if (error.message.includes("Incorrect payment amount")) {
        alert("The minting price has changed. Please try again.")
      } else {
        alert("Failed to mint NFT: " + error.message)
      }
    } finally {
      setMinting(false)
    }
  }

  // Reset imageMinted when capturedImage changes
  useEffect(() => {
    setImageMinted(false)
    setMintSuccess(false)
  }, [capturedImage])

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
      <Row>
        <Col md={6}>
          <p>
            {gatewayImageUrl ? (
              <>
                <strong>
                  IPFS Image{" "}
                  <a
                    href={gatewayImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    URL
                  </a>
                </strong>
              </>
            ) : (
              <em>Waiting for image upload...</em>
            )}
          </p>
        </Col>
        <Col md={6}>
          <p>
            {gatewayMetadataUrl ? (
              <>
                <strong>
                  Metadata{" "}
                  <a
                    href={gatewayMetadataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CID URL
                  </a>
                </strong>
              </>
            ) : (
              <em>Waiting for metadata upload...</em>
            )}
          </p>
        </Col>
      </Row>

      <div>
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
            <Row>
              <Col md={6}>
                <p>
                  Current Supply: {currentSupply} / {maxSupply}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  {holderStatus === null ? (
                    "Checking holder status..."
                  ) : holderStatus ? (
                    <>
                      Minting Price:{" "}
                      {currentSupply >= TIER2_LIMIT ? (
                        <span style={{ color: "red" }}>
                          {TIER3_PRICE} TEZ (Tier 3)
                        </span>
                      ) : currentSupply >= TIER1_LIMIT ? (
                        <span style={{ color: "orange" }}>
                          {TIER2_PRICE} TEZ (Tier 2)
                        </span>
                      ) : (
                        <span style={{ color: "green" }}>
                          {TIER1_PRICE} TEZ (Tier 1)
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ color: "red" }}>
                      You need to own an NFT to mint
                    </span>
                  )}
                </p>
              </Col>

              <p>Connected Address: {walletAddress}</p>
            </Row>

            <Button
              variant="primary"
              onClick={startMintingProcess}
              disabled={minting || currentSupply >= maxSupply || walletLoading || !holderStatus || imageMinted}
              style={{
                fontFamily: "var(--primary-font)",
                fontStyle: "italic",
                fontWeight: "bold",
                fontSize: "1.2rem",
                maxWidth: "200px",
              }}
            >
              {walletLoading
                ? "Loading..."
                : minting
                ? "Minting..."
                : currentSupply >= maxSupply
                ? "Max Supply Reached"
                : !holderStatus
                ? "Need NFT to Mint"
                : imageMinted
                ? "Already Minted"
                : "Mint this!"}
            </Button>
          </>
        )}
      </div>

      {mintSuccess && (
        <div>
          <p style={{ color: "green" }}>✅ NFT Minted Successfully!</p>
          <Row>
            <Col md={6}>
              <p style={{ color: "black" }}>
                Contract:{" "}
                <a
                  href={`https://better-call.dev/ghostnet/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/operations`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Better Call Dev
                </a>
              </p>
            </Col>
            <Col md={6}>
              {mintSuccess.opHash && (
                <p style={{ color: "black" }}>
                  Transaction:{" "}
                  <a
                    href={mintSuccess.opHashUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Better Call Dev
                  </a>
                </p>
              )}
            </Col>
          </Row>
        </div>
      )}
    </Container>
  )
}

export default MintNFTProcess
