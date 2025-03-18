import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { Button, Container } from "react-bootstrap";
import { useWallet } from "./WalletContext";
import lighthouse from "@lighthouse-web3/sdk";
import { encodeKey } from "@taquito/utils";
import axios from "axios";
import NFTVerification from "./NFTVerification"; // Import NFT Verification Component

const UploadImageWithWallet = ({ containerRef }) => {
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const { isConnected, beaconWallet, walletAddress } = useWallet();
  const [authMessage, setAuthMessage] = useState("");
  const [accessGranted, setAccessGranted] = useState(false); // Track NFT ownership

  useEffect(() => {
    const fetchAuthMessage = async () => {
      if (walletAddress) {
        try {
          const response = await axios.get(
            `https://encryption.lighthouse.storage/api/message/${walletAddress}`
          );
          if (response.status === 200 && response.data && response.data.length > 0) {
            setAuthMessage(response.data[0].message);
          } else {
            console.error("Failed to fetch auth message:", response);
            alert("Failed to fetch authentication message. Check console.");
          }
        } catch (error) {
          console.error("Error fetching auth message:", error);
          alert("Error fetching authentication message. Check console.");
        }
      }
    };

    fetchAuthMessage();
  }, [walletAddress]);

  const captureAndUpload = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!containerRef.current) {
      alert("No content detected for capture.");
      return;
    }
    if (!authMessage) {
      alert("Authentication message not available. Please try again.");
      return;
    }
    if (!accessGranted) {
      alert("You need to own an NFT to use this feature.");
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

      let publicKey = activeAccount.publicKey;
      console.log("✅ Original Public Key:", publicKey);

      if (!publicKey.startsWith("edpk") && !publicKey.startsWith("sppk") && !publicKey.startsWith("p2pk")) {
        publicKey = encodeKey(Buffer.from(publicKey, "hex"), "edpk");
        console.log("🔄 Converted Public Key to Base58:", publicKey);
      }

      if (!publicKey.startsWith("edpk") && !publicKey.startsWith("sppk") && !publicKey.startsWith("p2pk")) {
        throw new Error("Invalid public key format");
      }

      console.log("🔑 Validated Public Key:", publicKey);
      console.log("📝 Auth Message:", authMessage);

      const signedMessage = await beaconWallet.client.requestSignPayload({
        signingType: "raw",
        payload: Buffer.from(authMessage, "utf8").toString("hex"),
      });
      console.log("✍️ Signed Message:", signedMessage);

      const response = await lighthouse.uploadEncrypted(file, signedMessage.signature.trim(), publicKey);
      console.log("📤 Upload Response:", response);

      if (response.data && response.data.Hash) {
        const imageCid = response.data.Hash;
        const imageIpfsUrl = `ipfs://${imageCid}`;
        setIpfsUrl(imageIpfsUrl);
        console.log("✅ Image Uploaded to IPFS:", imageIpfsUrl);
      } else {
        console.error("❌ Upload Failed: Hash not found in response");
        throw new Error("Hash not found in response");
      }
    } catch (error) {
      console.error("❌ Upload Failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <NFTVerification setAccessGranted={setAccessGranted} /> {/* NFT Ownership Verification */}

      {isConnected ? (
        <div style={{ padding: "10px", textAlign: "center" }}>
          <Button
            variant="primary"
            onClick={captureAndUpload}
            disabled={uploading || !accessGranted}
          >
            {uploading ? "Uploading..." : accessGranted ? "Capture & Upload" : "NFT Required"}
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