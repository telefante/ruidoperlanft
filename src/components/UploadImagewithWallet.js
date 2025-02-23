import React, { useState } from "react";
import html2canvas from "html2canvas";
import { Button, Container } from "react-bootstrap";
import { useWallet } from "./WalletContext";
import lighthouse from "@lighthouse-web3/sdk";

const UploadImageWithWallet = ({ containerRef }) => {
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const { isConnected, beaconWallet } = useWallet();

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
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 1,
      });

      const imageBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      const timestamp = new Date().toISOString();
      const file = new File([imageBlob], `captured-image-${timestamp}.png`, {
        type: "image/png",
      });

      const activeAccount = await beaconWallet.client.getActiveAccount();
      if (!activeAccount || !activeAccount.publicKey) {
        alert("Wallet is not fully connected. Please reconnect.");
        return;
      }

      const publicKey = activeAccount.publicKey;
      const authMessageResponse = await lighthouse.getAuthMessage(publicKey);
      const signedMessage = await beaconWallet.client.requestSignPayload({
        signingType: "raw",
        payload: Buffer.from(authMessageResponse.data.message, "utf8").toString("hex"),
      });

      const response = await lighthouse.uploadEncrypted(file, signedMessage.signature.trim(), publicKey);
      const imageCid = response.data.Hash;
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

export default UploadImageWithWallet;