import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Button, Container } from "react-bootstrap";
import { useWallet } from "./WalletContext"; // Import wallet context hook
import lighthouse from "@lighthouse-web3/sdk";

const UploadImageIpfs = ({ containerRef }) => {
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState(null);

  // Wallet Context Hook
  const { isConnected, walletAddress, beaconWallet } = useWallet();
  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY;

  const uploadFileWithTemple = async (file, apiKey, publicKey) => {
    try {
      const signedMessage = await beaconWallet.client.requestSignPayload({
        signingType: "raw",
        payload: Buffer.from(await lighthouse.getAuthMessage(publicKey), "utf8").toString("hex"),
      });

      console.log("✅ Signed Lighthouse Auth Message:", signedMessage.signature.trim());

      const response = await lighthouse.uploadEncrypted(file, apiKey, publicKey, signedMessage.signature.trim());
      console.log("✅ File uploaded successfully:", response);

      return response;
    } catch (error) {
      console.error("❌ Upload Failed:", error);
      throw error;
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
      const file = new File([imageBlob], `captured-image-${timestamp}.png`, {
        type: "image/png",
      });

      // Get Public Key
      const activeAccount = await beaconWallet.client.getActiveAccount();
      if (!activeAccount || !activeAccount.publicKey) {
        alert("Wallet is not fully connected. Please reconnect.");
        return;
      }

      const publicKey = activeAccount.publicKey;
      console.log("✅ Fetched Public Key:", publicKey);

      // Upload file
      const fileResponse = await uploadFileWithTemple(file, LIGHTHOUSE_API_KEY, publicKey);
      const imageCid = fileResponse.data.Hash;
      const imageIpfsUrl = `ipfs://${imageCid}`;
      setIpfsUrl(imageIpfsUrl);

      console.log("✅ Image Uploaded to IPFS:", imageIpfsUrl);
    } catch (error) {
      console.error("❌ Upload Failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      {isConnected ? (
        <div style={{ padding: "10px", textAlign: "center" }}>
          <Button
            variant="primary"
            onClick={captureAndUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Capture & Upload"}
          </Button>

          {ipfsUrl && (
            <p>
              ✅ File Uploaded:{" "}
              <a
                href={`https://gateway.lighthouse.storage/ipfs/${ipfsUrl.split("ipfs://")[1]}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on IPFS
              </a>
            </p>
          )}
        </div>
      ) : (
        <p>Please connect your wallet to upload.</p>
      )}
    </Container>
  );
};

export default UploadImageIpfs;