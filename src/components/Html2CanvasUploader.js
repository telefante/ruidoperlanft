import React, { useRef, useState } from "react"
import * as lighthouse from "@lighthouse-web3/sdk"
import html2canvas from "html2canvas"
import { Button, Form, Container, Modal } from "react-bootstrap"
import MintNFTFromIPFS from "./MintNFTFromIPFS"
import { useWallet } from "./WalletContext" // Import the useWallet hook
import ipfsOnlyHash from "ipfs-only-hash"

const Html2CanvasUploader = ({ containerRef, perlinSettings }) => {
  const captureRef = useRef(null)
  const [name, setName] = useState("RuidoPerla_Now")
  const [description, setDescription] = useState(
    "This is a real-time generated NFT from the Perlin Noise algorithm."
  )
  const [uploading, setUploading] = useState(false)
  const [ipfsUrl, setIpfsUrl] = useState(null)
  const [metadataUrl, setMetadataUrl] = useState(null)
  const extractedMetadataCid =
    metadataUrl && metadataUrl.includes("ipfs://")
      ? metadataUrl.split("ipfs://")[1]
      : null
  const [showMetadataPreview, setShowMetadataPreview] = useState(false)
  const [metadataJson, setMetadataJson] = useState(null)
  const [showMinting, setShowMinting] = useState(false)

  // Fetch API Key from Environment Variables
  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY
  const { isConnected, walletAddress } = useWallet() // Get the isConnected state and walletAddress
  const CREATOR = process.env.GATSBY_RPNNFT_CREATOR
  // console.log("isConnected:", isConnected)
  // console.log("walletAddress:", walletAddress)
  // console.log("CREATOR:", CREATOR)
  
  const generateMetadata = async () => {
    const timestamp = new Date().toISOString();
    const safePerlinSettings = perlinSettings || { amplitude: 0, scale: 0, frequency: 0, octaves: 0 };
  
    try {
      // Create placeholder image
      const imageBlob = new Blob(["Temporary Image Data"], { type: "image/png" });
      const imageArrayBuffer = await imageBlob.arrayBuffer();
      const imageUint8Array = new Uint8Array(imageArrayBuffer);
  
      // Generate estimated IPFS CID for image
      const predictedImageCid = await ipfsOnlyHash.of(imageUint8Array);
  
      // Generate estimated metadata CID
      const metadataJson = {
        artifactUri: `ipfs://${predictedImageCid}`,
        name: `RuidoPerla#${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        description: `This NFT captures the evolving Perlin noise landscape.`,
        minter: walletAddress,
        attributes: [
          { name: "Amplitude", value: safePerlinSettings.amplitude.toString() },
          { name: "Scale", value: safePerlinSettings.scale.toString() },
          { name: "Frequency", value: safePerlinSettings.frequency.toString() },
          { name: "Octaves", value: safePerlinSettings.octaves.toString() }
        ],
        displayUri: `ipfs://${predictedImageCid}`,
        thumbnailUri: `ipfs://${predictedImageCid}`
      };
  
      const metadataUint8Array = new TextEncoder().encode(JSON.stringify(metadataJson));
      const predictedMetadataCid = await ipfsOnlyHash.of(metadataUint8Array);
  
      setMetadataJson(metadataJson);
      setIpfsUrl(`ipfs://${predictedImageCid}`);
      setMetadataUrl(`ipfs://${predictedMetadataCid}`);
      setShowMetadataPreview(true);
    } catch (error) {
      console.error("❌ Error generating estimated IPFS CID:", error);
    }
  };


  const confirmUpload = async () => {
    setShowMetadataPreview(false)
    await captureAndUpload() // Proceed with upload
  }

  const captureAndUpload = async () => {
    if (!isConnected) return // Only allow upload when wallet is connected
    if (!containerRef.current) return
    setUploading(true)

    try {
      //   📸 Capture the HTML element as an image
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 1,
        ignoreElements: element => {
          // Exclude the entire controls container and the Minimize Controls button
          return (
            element.classList.contains("controls") ||
            element.classList.contains("minimize-button") ||
            element.classList.contains("wallet-connection")
          )
        },
      })

      const imageBlob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
      )
      const timestamp = new Date().toISOString()
      const file = new File([imageBlob], `${name}-${timestamp}.png`, {
        type: "image/png",
      })

      // ⬆️ Upload image to IPFS via Lighthouse
      const fileResponse = await lighthouse.upload([file], LIGHTHOUSE_API_KEY)
      const imageCid = fileResponse.data.Hash
      const imageIpfsUrl = `ipfs://${imageCid}`
      setIpfsUrl(imageIpfsUrl)

      // 🎲 Generate NFT Metadata with random "entropie" value
      const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
        type: "application/json",
      })
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      })

      // ⬆️ Upload metadata to IPFS
      const metadataResponse = await lighthouse.upload(
        [metadataFile],
        LIGHTHOUSE_API_KEY
      )
      const metadataCid = metadataResponse.data.Hash
      const metadataIpfsUrl = `ipfs://${metadataCid}`
      setMetadataUrl(metadataIpfsUrl || "Unknown Metadata URL")

      console.log("✅ Image Uploaded to IPFS:", imageIpfsUrl)
      console.log("✅ Metadata Uploaded to IPFS:", metadataIpfsUrl)
    } catch (error) {
      console.error("❌ Error capturing or uploading:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Container>
      {isConnected ? (
        <Form style={{ padding: "10px", textAlign: "center" }}>
          {/* Upload Button */}
          <Button
            variant="primary"
            onClick={generateMetadata}
            disabled={uploading}
          >
            {uploading ? "Processing..." : "Preview Minting"}
          </Button>
        

          {/* Display IPFS URLs */}
          {ipfsUrl && (
            <div>
              <h3>File Uploaded!</h3>
              <p>
                <strong>IPFS CID:</strong> {ipfsUrl}
              </p>
              <p>
                <a
                  href={`https://gateway.lighthouse.storage/ipfs/${
                    ipfsUrl.split("ipfs://")[1]
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File on IPFS
                </a>
              </p>
            </div>
          )}

          {metadataUrl && (
            <Container style={{ fontSize: "10px" }}>
              <h3>Metadata Uploaded!</h3>
              <p>
                <strong>Metadata IPFS CID:</strong> {metadataUrl}
              </p>
              <p>
                <a
                  href={`https://gateway.lighthouse.storage/ipfs/${
                    metadataUrl && metadataUrl.includes("ipfs://")
                      ? metadataUrl.split("ipfs://")[1]
                      : metadataUrl
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Metadata on IPFS
                </a>
              </p>
            </Container>
          )}
        </Form>
      ) : (
        <p>Please connect your wallet to upload.</p>
      )}

<Modal show={showMetadataPreview} onHide={() => setShowMetadataPreview(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Minting Preview</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <pre style={{ backgroundColor: "#f8f9fa", padding: "10px" }}>
      {JSON.stringify(metadataJson, null, 2)}
    </pre>
    <p><strong>Estimated Image CID:</strong> {ipfsUrl}</p>
    <p><strong>Estimated Metadata CID:</strong> {metadataUrl}</p>
    <p>You are about to mint an NFT with the above metadata.</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowMetadataPreview(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={() => setShowMinting(true)}>
      Confirm & Mint
    </Button>
  </Modal.Footer>
</Modal>
    </Container>
  )
}

export default Html2CanvasUploader
