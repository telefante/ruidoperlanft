import React, { useRef, useState } from "react"
import * as lighthouse from "@lighthouse-web3/sdk"
import html2canvas from "html2canvas"
import { Button, Container, Modal } from "react-bootstrap"
import { TezosToolkit, MichelsonMap } from "@taquito/taquito"
import { useWallet } from "./WalletContext"
import ipfsOnlyHash from "ipfs-only-hash"

const MintNFTProcess = ({ containerRef, perlinSettings }) => {
  const [uploading, setUploading] = useState(false)
  const [minting, setMinting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [ipfsUrl, setIpfsUrl] = useState(null)
  const [metadataUrl, setMetadataUrl] = useState(null)
  const [metadataJson, setMetadataJson] = useState(null)
  const [showMinting, setShowMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)

  const { isConnected, walletAddress, beaconWallet } = useWallet()
  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY
  const CONTRACT = process.env.GATSBY_TEZOS_REALTIME_CONTRACT

  const generateMetadata = async () => {
    setShowModal(true)
    const timestamp = new Date().toISOString()
    const safePerlinSettings = perlinSettings || {
      amplitude: 0,
      scale: 0,
      frequency: 0,
      octaves: 0,
    }

    try {
      const imageBlob = new Blob(["Temporary Image Data"], {
        type: "image/png",
      })
      const imageArrayBuffer = await imageBlob.arrayBuffer()
      const imageUint8Array = new Uint8Array(imageArrayBuffer)
      const predictedImageCid = await ipfsOnlyHash.of(imageUint8Array)

      const metadata = {
        artifactUri: `ipfs://${predictedImageCid}`,
        name: `RuidoPerla#${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        description: `This NFT captures the evolving Perlin noise landscape.`,
        minter: walletAddress,
        attributes: [
          { name: "Amplitude", value: safePerlinSettings.amplitude.toString() },
          { name: "Scale", value: safePerlinSettings.scale.toString() },
          { name: "Frequency", value: safePerlinSettings.frequency.toString() },
          { name: "Octaves", value: safePerlinSettings.octaves.toString() },
        ],
        displayUri: `ipfs://${predictedImageCid}`,
        thumbnailUri: `ipfs://${predictedImageCid}`,
      }

      const metadataUint8Array = new TextEncoder().encode(
        JSON.stringify(metadata)
      )
      const predictedMetadataCid = await ipfsOnlyHash.of(metadataUint8Array)

      setMetadataJson(metadata)
      setIpfsUrl(`ipfs://${predictedImageCid}`)
      setMetadataUrl(`ipfs://${predictedMetadataCid}`)
    } catch (error) {
      console.error("❌ Error generating estimated IPFS CID:", error)
    }
  }

  const confirmUpload = async () => {
    setUploading(true)

    try {
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 1,
      })

      const imageBlob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
      )
      const file = new File([imageBlob], `RuidoPerla-${Date.now()}.png`, {
        type: "image/png",
      })

      const fileResponse = await lighthouse.upload([file], LIGHTHOUSE_API_KEY)
      const imageCid = fileResponse.data.Hash
      setIpfsUrl(`ipfs://${imageCid}`)

      const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
        type: "application/json",
      })
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      })

      const metadataResponse = await lighthouse.upload(
        [metadataFile],
        LIGHTHOUSE_API_KEY
      )
      const metadataCid = metadataResponse.data.Hash
      setMetadataUrl(`ipfs://${metadataCid}`)

      setShowMinting(true)
    } catch (error) {
      console.error("❌ Error uploading files to IPFS:", error)
    } finally {
      setUploading(false)
    }
  }
  const mintNFT = async () => {
    if (!isConnected || !walletAddress || !beaconWallet) {
      alert("Please connect your wallet first!")
      return
    }
    if (!metadataUrl) {
      alert("Metadata CID is missing!")
      return
    }

    setMinting(true)

    try {
      const Tezos = new TezosToolkit("https://ghostnet.ecadinfra.com")

      // Ensure wallet is connected and permissions are granted
       let activeAccount = await beaconWallet.client.getActiveAccount()
      if (!activeAccount) {
        console.log("🔑 Requesting Wallet Permissions...")
        await beaconWallet.requestPermissions({ network: { type: "ghostnet" } })
        activeAccount = await beaconWallet.client.getActiveAccount()
        if (!activeAccount) {
          alert("Wallet not connected. Please try again.")
          setMinting(false)
          return
        }
      }

      // Set the wallet provider with the existing Beacon Wallet instance
      Tezos.setWalletProvider(beaconWallet)
      // Tezos.setProvider({ signer: beaconWallet });

      

      console.log(`📜 Fetching contract at: ${CONTRACT}`)
      const contract = await Tezos.contract.at(CONTRACT)
      console.log("✅ Contract successfully fetched.")

      const tokenId = Math.floor(Math.random() * 100000)
      const safePerlinSettings = perlinSettings || {
        amplitude: 0,
        scale: 0,
        frequency: 0,
        octaves: 0,
      }

      // Construct metadata following TZIP-12 schema
      const metadataContent = {
        artifactUri: `${ipfsUrl}`,
        name: `RuidoPerla#${String(tokenId).padStart(3, "0")}`,
        description: `This NFT captures the evolving Perlin noise landscape.`,
        minter: walletAddress,
        attributes: [
          { name: "Amplitude", value: safePerlinSettings.amplitude.toString() },
          { name: "Scale", value: safePerlinSettings.scale.toString() },
          { name: "Frequency", value: safePerlinSettings.frequency.toString() },
          { name: "Octaves", value: safePerlinSettings.octaves.toString() },
        ],
        displayUri: `${ipfsUrl}`,
        thumbnailUri: `${ipfsUrl}`,
      }

      const metadataMap = new MichelsonMap()
      metadataMap.set(
        "",
        Buffer.from(JSON.stringify(metadataContent), "utf8").toString("hex")
      )

      console.log(
        `🔹 Creating NFT with Metadata: ${JSON.stringify(metadataContent)}`
      )
      console.log(
        "📜 Available Contract Methods:",
        Object.keys(contract.methods)
      )

      try {
        console.log("📤 Sending create_token transaction...")
        const createOp = await contract.methods
          .create_token(tokenId, metadataMap)
          .send()
        await createOp.confirmation(1)
        console.log(`✅ Token ${tokenId} Created! TX: ${createOp.hash}`)
      } catch (error) {
        console.error("❌ Error in create_token:", error.message || error)
        alert(
          `Error: ${
            error.message || "Unknown error occurred while minting NFT."
          }`
        )
        setMinting(false)
        return
      }

      console.log("📤 Sending mint_tokens transaction...")
      const mintOp = await contract.methods
        .mint_tokens([{ owner: walletAddress, token_id: tokenId, amount: 1 }])
        .send()
      await mintOp.confirmation(1)
      console.log(`✅ NFT Minted to ${walletAddress}! TX: ${mintOp.hash}`)

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
      <Button variant="primary" onClick={generateMetadata} disabled={uploading}>
        {uploading ? "Processing..." : "Preview Minting Process"}
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Mint the Pearl?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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

          {!showMinting ? (
            <Button variant="primary" onClick={confirmUpload}>
              Confirm & Upload to IPFS
            </Button>
          ) : (
            <Button variant="primary" onClick={mintNFT} disabled={minting}>
              {minting ? "Minting..." : "Confirm & Mint"}
            </Button>
          )}

          {mintSuccess && (
            <p style={{ color: "green" }}>✅ NFT Minted Successfully!</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default MintNFTProcess
