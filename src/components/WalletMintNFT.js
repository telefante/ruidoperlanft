import React, { useState, useRef } from "react"
import * as lighthouse from "@lighthouse-web3/sdk"
import html2canvas from "html2canvas"
import { Button, Form, Container } from "react-bootstrap"
import { useWallet } from "./WalletContext" // Import wallet context hook
import { TezosToolkit } from "@taquito/taquito"
import { encodeKey } from "@taquito/utils"

const WalletMintNFT = ({ containerRef }) => {
  const captureRef = useRef(null)
  const [name, setName] = useState("RuidoPerla_Now")
  const [description, setDescription] = useState(
    "This is a real-time generated NFT from the Perlin Noise algorithm."
  )
  const [uploading, setUploading] = useState(false)
  const [minting, setMinting] = useState(false)
  const [ipfsUrl, setIpfsUrl] = useState(null)
  const [metadataUrl, setMetadataUrl] = useState(null)
  const [transactionHash, setTransactionHash] = useState(null)

  // Wallet Context Hook
  const { isConnected, walletAddress, connectWallet, beaconWallet } =
    useWallet()

  // Tezos Contract Configuration
  const TEZOS_RPC = process.env.GATSBY_TEZOS_RPC
  const TEZOS_CONTRACT = process.env.GATSBY_TEZOS_CONTRACT
  const Tezos = new TezosToolkit(TEZOS_RPC)

  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY

  const getLighthouseAuthToken = async () => {
    if (!walletAddress || !beaconWallet) {
      alert("Please connect your wallet first!")
      return
    }

    try {
      const activeAccount = await beaconWallet.client.getActiveAccount()
      if (!activeAccount || !activeAccount.publicKey) {
        alert(
          "Wallet is not fully connected or does not provide a public key. Please reconnect."
        )
        return
      }

      const publicKey = activeAccount.publicKey
      console.log("✅ Fetched Public Key:", publicKey)

      // Fetch authentication message from Lighthouse
      //   const authMessageResponse = await lighthouse.getAuthMessage(publicKey);
      //   if (!authMessageResponse || !authMessageResponse.data || !authMessageResponse.data.message) {
      //     throw new Error("Failed to get authentication message from Lighthouse.");
      //   }
      //   const authMessage = authMessageResponse.data.message;
      //   console.log("🔑 Lighthouse Auth Message:", authMessage);

      // Sign the authentication message using Beacon Wallet
      //   const signedMessage = await beaconWallet.client.requestSignPayload({
      //     signingType: "raw",
      //     payload: Buffer.from(authMessage, "utf8").toString("hex"),
      //   });

      console.log(
        "✅ Signed Lighthouse Auth Message:",
        signedMessage.signature.trim()
      )

      const signedMessage = await beaconWallet.signMessage(
        await lighthouse.getAuthMessage(publicKey)
      )

      const response = await lighthouse.uploadEncrypted(
        file,
        apiKey,
        LIGHTHOUSE_API_KEY,
        signedMessage
      )

      // Authenticate with Lighthouse
      const authTokenResponse = await lighthouse.getAuth(
        publicKey,
        signedMessage.signature.trim()
      )
      if (
        !authTokenResponse ||
        !authTokenResponse.data ||
        !authTokenResponse.data.token
      ) {
        throw new Error("Lighthouse authentication failed.")
      }

      return response
    } catch (error) {
      console.error("❌ Authentication Error:", error)
    }
  }

  const captureAndUpload = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!")
      return
    }
    if (!containerRef.current) {
      alert("No content detected for capture.")
      return
    }

    setUploading(true)

    try {
      // 📸 Capture Screenshot
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 1,
      })

      // Convert to Blob & Upload to IPFS
      const imageBlob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
      )
      const timestamp = new Date().toISOString()
      const file = new File([imageBlob], `${name}-${timestamp}.png`, {
        type: "image/png",
      })

      // Authenticate with Lighthouse
      const authToken = await getLighthouseAuthToken()
      if (!authToken)
        throw new Error("Failed to get Lighthouse authentication token")

      // Upload Image using Lighthouse's Encrypted Upload
      const fileResponse = await lighthouse.uploadEncrypted(
        file,
        authToken,
        walletAddress
      )
      const imageCid = fileResponse.data.Hash
      const imageIpfsUrl = `ipfs://${imageCid}`
      setIpfsUrl(imageIpfsUrl)

      console.log("✅ Image Uploaded to IPFS:", imageIpfsUrl)

      // 🎲 Generate Metadata JSON
      const metadataJson = {
        name,
        description: `${description} (Generated: ${timestamp})`,
        entropie: Math.random().toFixed(6),
        image: imageIpfsUrl,
      }

      // Upload Metadata JSON to IPFS
      const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
        type: "application/json",
      })
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      })

      const metadataResponse = await lighthouse.uploadEncrypted(
        metadataFile,
        authToken,
        walletAddress
      )
      const metadataCid = metadataResponse.data.Hash
      const metadataIpfsUrl = `ipfs://${metadataCid}`
      setMetadataUrl(metadataIpfsUrl)

      console.log("✅ Metadata Uploaded to IPFS:", metadataIpfsUrl)

      // 🛠️ Mint the NFT
      await mintNFT(metadataIpfsUrl)
    } catch (error) {
      console.error("❌ Upload Failed:", error)
    } finally {
      setUploading(false)
    }
  }

  const mintNFT = async metadataIpfsUrl => {
    if (!walletAddress || !beaconWallet) {
      alert("Please connect your wallet first!")
      return
    }

    setMinting(true)

    try {
      // Get the wallet's signer
      const activeAccount = await beaconWallet.client.getActiveAccount()
      if (!activeAccount) {
        await connectWallet() // Reconnect wallet if needed
        alert("Wallet was not connected. Please try again.")
        return
      }
      // Set the wallet as the signer for Tezos transactions
      Tezos.setWalletProvider(beaconWallet)

      const contract = await Tezos.contract.at(TEZOS_CONTRACT)

      // 🛠️ Minting Parameters
      const tokenId = Math.floor(Math.random() * 100000)
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
      ]

      // 📌 Send Minting Transaction
      const op = await contract.methods.mint_tokens(mintParams).send()
      await op.confirmation()
      setTransactionHash(op.hash)

      console.log("✅ NFT Minted on Tezos! Tx Hash:", op.hash)
    } catch (error) {
      console.error("❌ Minting Error:", error)
    } finally {
      setMinting(false)
    }
  }

  return (
    <Container>
      {isConnected ? (
        <Form style={{ padding: "10px", textAlign: "center" }}>
          <Button
            variant="primary"
            onClick={captureAndUpload}
            disabled={uploading || minting}
          >
            {uploading
              ? "Uploading..."
              : minting
              ? "Minting..."
              : "Capture, Upload & Mint"}
          </Button>

          {/* Editable NFT Name & Description */}
          <Form.Group controlId="nft-name">
            <Form.Label>NFT Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="nft-description">
            <Form.Label>NFT Description</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Form.Group>

          {transactionHash && (
            <p>
              🎉{" "}
              <a
                href={`https://ghostnet.tzkt.io/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View NFT on Tezos
              </a>
            </p>
          )}
        </Form>
      ) : (
        <p>Please connect your wallet to upload and mint.</p>
      )}
    </Container>
  )
}

export default WalletMintNFT
