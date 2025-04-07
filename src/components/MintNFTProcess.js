import React, { useRef, useState, useEffect } from "react"
import * as lighthouse from "@lighthouse-web3/sdk"
// import html2canvas from "html2canvas"
import { Button, Container, Row, Col, Modal } from "react-bootstrap"
import { useWallet } from "./WalletContext"
// import { color } from "framer-motion"
// import ipfsOnlyHash from "ipfs-only-hash"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Dynamically import Tezos-related modules only in browser
const getTezosModules = async () => {
  if (!isBrowser) return null
  const { MichelsonMap } = await import("@taquito/taquito")
  return { MichelsonMap }
}

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
  const [imageMinted, setImageMinted] = useState(false) // New state to track if image has been minted

  // New state for metadata preview modal
  const [showMetadataModal, setShowMetadataModal] = useState(false)
  const [metadataToPreview, setMetadataToPreview] = useState(null)

  // Get wallet context
  const { isConnected, walletAddress, beaconWallet, tezos, connectWallet } =
    useWallet()

  // Add loading state for wallet
  const [walletLoading, setWalletLoading] = useState(false)
  const [tezosModules, setTezosModules] = useState(null)

  // Load Tezos modules when component mounts
  useEffect(() => {
    const loadTezosModules = async () => {
      if (isBrowser) {
        const modules = await getTezosModules()
        setTezosModules(modules)
      }
    }
    loadTezosModules()
  }, [])

  // Check wallet connection and supply when component mounts or wallet state changes
  useEffect(() => {
    const initializeWalletState = async () => {
      if (isBrowser && tezos && isConnected && walletAddress) {
        try {
          setWalletLoading(true)
          await checkSupply()
          // await checkHolderStatus()
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
  // const PreMintedRPNCollection = process.env.GATSBY_RUIDOPERLANFT_CONTRACT
  const NETWORK_TYPE = process.env.GATSBY_NETWORK_TYPE || "ghostnet" // Default to ghostnet

  // console.log("🔍 Contract Addresses:", {
  //   realtimeRPNFTContract,
  //   PreMintedRPNCollection,
  //   FIRST_CREATOR
  // })

  const TIER1_LIMIT = 1000 // First 8 tokens
  const TIER2_LIMIT = 1500 // Next 2 tokens (tokens 9-10)
  // const TIER3_LIMIT = 16 // Last 2 tokens (tokens 11-12)

  const TIER1_PRICE = 1 // 2 TEZ
  const TIER2_PRICE = 3 // 4 TEZ
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

      // await uploadMetadataToIPFS(imageIpfsUrl) // ✅ Proceed to metadata upload
      // Generate metadata and show modal for preview
      const metadata = await generateMetadata(imageIpfsUrl)
      setMetadataToPreview(metadata)
      setShowMetadataModal(true)
    } catch (error) {
      console.error("❌ Error in minting process:", error)
      setMinting(false)
    }
  }

  const uploadWithRetry = async (file, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const fileResponse = await lighthouse.upload([file], LIGHTHOUSE_API_KEY)
        if (fileResponse.data && fileResponse.data.Hash) {
          return fileResponse
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error)
        if (attempt === retries) throw error
      }
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

      console.log("Image size:", file.size, "Image type:", file.type)

      const fileResponse = await uploadWithRetry(file)
      const imageCid = fileResponse.data.Hash
      const ipfsImageUrl = `ipfs://${imageCid}`
      setIpfsUrl(ipfsImageUrl)
      console.log(
        `✅ Image Uploaded: https://gateway.lighthouse.storage/ipfs/${
          ipfsImageUrl.split("ipfs://")[1]
        }`
      )

      return ipfsImageUrl
    } catch (error) {
      console.error("❌ Error uploading image:", error)
      setMinting(false)
      return null
    } finally {
      setUploading(false)
    }
  }

  const generateMetadata = async imageIpfsUrl => {
    console.log("📤 Generating Metadata...")
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
          { name: "Tier Price", value: getMintPrice().toString() },
        ],
        displayUri: imageIpfsUrl.replace(".png", ".jpg"),
        artifactUri: imageIpfsUrl,
        description: `You found a pearl in noise—Perlin noise, Ruido Perla. A landscape in flux, shifting with Amplitude ${perlinSettings.amplitude}, shaped by Scale ${perlinSettings.scale}, whispering in the frequencies of endless recombination. This NFT is not a static image—it is a key to a living simulation, evolving in real-time at ruidoperlanft.netlify.app. 
        A fragment of the infinite, seen once, then lost to the next wave.`,
        mintingTool: "https://ruidoperlanft.netlify.app",
        thumbnailUri: imageIpfsUrl.replace(".png", ".jpg"),
      }
      return metadataJson
    } catch (error) {
      console.error("❌ Error generating metadata:", error)
      setMinting(false)
      return null
    } finally {
      setUploading(false)
    }
  }

  const uploadMetadataToIPFS = async (imageIpfsUrl, metadataJson) => {
    console.log("📤 Uploading Metadata to IPFS...")
    setUploading(true)

    try {
      const tokenId = Math.floor(Math.random() * 100000)
      const formattedTokenId = String(tokenId).padStart(3, "0")
      const currentDate = new Date().toISOString()

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
        rawMax: max,
      })

      setMaxSupply(max.toNumber())
      setCurrentSupply(current.toNumber())
    } catch (error) {
      console.error("Error checking supply:", error)
      console.error("Contract address:", realtimeRPNFTContract)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      })
    }
  }

  const ADMIN_ADDRESS = process.env.GATSBY_RPNNFT_CREATOR

  const mintNFT = async (tokenId, metadataIpfsUrl, imageIpfsUrl) => {
    if (!isBrowser || !tezosModules) return

    console.log("🚀 Minting NFT...")

    if (!isConnected || !walletAddress || !beaconWallet) {
      alert("Please connect your wallet first!")
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

      // Create metadata map using dynamically imported MichelsonMap
      const metadataMap = new tezosModules.MichelsonMap()
      metadataMap.set("", Buffer.from(`${metadataIpfsUrl}`).toString("hex"))

      let mintOp

      if (walletAddress === ADMIN_ADDRESS) {
        console.log("✨ Admin Minting...")
        mintOp = await contract.methods
          .admin_mint([{ metadata: metadataMap, to_: walletAddress }])
          .send({
            storageLimit: 1000,
            gasLimit: 10000,
          })
      } else {
        // Get mint price based on current supply
        const mintAmount = getMintPrice()

        console.log("📤 Sending mint transaction with amount:", {
          tez: mintAmount,
          mutez: mintAmount * 1000000,
          currentSupply,
          tier:
            currentSupply >= TIER2_LIMIT
              ? "Tier 3"
              : currentSupply >= TIER1_LIMIT
              ? "Tier 2"
              : "Tier 1",
        })

        mintOp = await contract.methods
          .mint([{ metadata: metadataMap, to_: walletAddress }])
          .send({
            amount: mintAmount,
            mutez: false,
            storageLimit: 1000,
            gasLimit: 10000,
          })
      }

      await mintOp.confirmation(1)

      // Add operation hash link
      const opHashUrl = `https://better-call.dev/${NETWORK_TYPE}/opg/${mintOp.opHash}/contents`
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
        alert(
          "The contract is currently being updated. Please try again in a few minutes."
        )
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

      {/* Metadata Preview Modal */}
      <Modal show={showMetadataModal} onHide={() => setShowMetadataModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Metadata Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre style={{ fontSize: "0.4rem" }}>{JSON.stringify(metadataToPreview, null, 2)}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMetadataModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              setShowMetadataModal(false)
              await uploadMetadataToIPFS(
                metadataToPreview.artifactUri,
                metadataToPreview
              )
            }}
          >
            Upload to IPFS
          </Button>
        </Modal.Footer>
      </Modal>

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
                  Minting Price:{" "}
                  {walletAddress === ADMIN_ADDRESS ? (
                    <span style={{ color: "purple" }}>FREE (Admin Mint)</span>
                  ) : currentSupply >= TIER2_LIMIT ? (
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
                </p>
              </Col>

              <p>Connected Address: {walletAddress}</p>
            </Row>

            <Button
              variant="primary"
              onClick={startMintingProcess}
              disabled={
                minting ||
                currentSupply >= maxSupply ||
                walletLoading ||
                imageMinted ||
                !tezosModules
              }
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
                : imageMinted
                ? "Already Minted"
                : !tezosModules
                ? "Loading Tezos..."
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
                  href={`https://better-call.dev/ghostnet/${realtimeRPNFTContract}/operations`}
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
