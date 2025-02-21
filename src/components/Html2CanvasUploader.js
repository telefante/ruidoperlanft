import React, { useRef, useState } from "react";
import * as lighthouse from "@lighthouse-web3/sdk";
import html2canvas from "html2canvas";

const Html2CanvasUploader = ({containerRef}) => {
  const captureRef = useRef(null);
  const [name, setName] = useState("Generated NFT");
  const [description, setDescription] = useState("This is an auto-generated NFT.");
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const [metadataUrl, setMetadataUrl] = useState(null);
//   const [imageBlob, setImageBlob] = useState(null);

 
  
  // Fetch API Key from Environment Variables
  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY;

  const captureAndUpload = async () => {
    if (!containerRef.current) return;
    setUploading(true);
    
    try {
    //   📸 Capture the HTML element as an image
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 1,
        ignoreElements: (element) => {
            // Exclude the entire controls container and the Minimize Controls button
            return element.classList.contains("controls") || element.classList.contains("minimize-button") || element.classList.contains("wallet-connection");
          },
      });

    
      const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      const timestamp = new Date().toISOString();
      const file = new File([imageBlob], `${name}-${timestamp}.png`, { type: "image/png" });


      // ⬆️ Upload image to IPFS via Lighthouse
      const fileResponse = await lighthouse.upload([file], LIGHTHOUSE_API_KEY);
      const imageCid = fileResponse.data.Hash;
      const imageIpfsUrl = `ipfs://${imageCid}`;
      setIpfsUrl(imageIpfsUrl);

      // 🎲 Generate NFT Metadata with random "entropie" value
      const metadataJson = {
        name,
        description,
        entropie: Math.random().toFixed(6), // Random number between 0-1
        image: imageIpfsUrl, // Link to uploaded file
      };

      // Convert metadata JSON to Blob
      const metadataBlob = new Blob([JSON.stringify(metadataJson)], { type: "application/json" });
      const metadataFile = new File([metadataBlob], "metadata.json", { type: "application/json" });

      // ⬆️ Upload metadata to IPFS
      const metadataResponse = await lighthouse.upload([metadataFile], LIGHTHOUSE_API_KEY);
      const metadataCid = metadataResponse.data.Hash;
      const metadataIpfsUrl = `ipfs://${metadataCid}`;
      setMetadataUrl(metadataIpfsUrl);

      console.log("✅ Image Uploaded to IPFS:", imageIpfsUrl);
      console.log("✅ Metadata Uploaded to IPFS:", metadataIpfsUrl);
    } catch (error) {
      console.error("❌ Error capturing or uploading:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Generate & Upload NFT to IPFS</h2>

      {/* Editable NFT Name & Description */}
      <input type="text" placeholder="NFT Name" value={name} onChange={(e) => setName(e.target.value)} />
      <br />
      <input type="text" placeholder="NFT Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <br />

      {/* Capture Target */}
      <div ref={containerRef.current} style={{ width: "300px", height: "200px", backgroundColor: "#ddd", margin: "20px auto", textAlign: "center" }}>
        <h3>🎨 NFT Preview</h3>
        <p>(Captured area will be uploaded)</p>
      </div>

      {/* Upload Button */}
      <button onClick={captureAndUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Capture & Upload"}
      </button>

      {/* Display IPFS URLs */}
      {ipfsUrl && (
        <div>
          <h3>File Uploaded!</h3>
          <p><strong>IPFS CID:</strong> {ipfsUrl}</p>
          <p><a href={`https://gateway.lighthouse.storage/ipfs/${ipfsUrl.split("ipfs://")[1]}`} target="_blank" rel="noopener noreferrer">View File on IPFS</a></p>
        </div>
      )}

      {metadataUrl && (
        <div>
          <h3>Metadata Uploaded!</h3>
          <p><strong>Metadata IPFS CID:</strong> {metadataUrl}</p>
          <p><a href={`https://gateway.lighthouse.storage/ipfs/${metadataUrl.split("ipfs://")[1]}`} target="_blank" rel="noopener noreferrer">View Metadata on IPFS</a></p>
        </div>
      )}
    </div>
  );
};

export default Html2CanvasUploader;