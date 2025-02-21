import React, { useState } from "react";
import * as lighthouse from "@lighthouse-web3/sdk";

const IpfsUploader = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState(null);

  // Fetch API Key from Environment Variables
  const LIGHTHOUSE_API_KEY = process.env.GATSBY_LIGHTHOUSE_API_KEY;
console.log("LIGHTHOUSE_API_KEY:", LIGHTHOUSE_API_KEY);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadToLighthouse = async () => {
    if (!file || !name || !description) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    setUploading(true);

    try {
      const response = await lighthouse.upload([file], LIGHTHOUSE_API_KEY);
      
      const cid = response.data.Hash;
      const ipfsFileUrl = `ipfs://${cid}`;
      setIpfsUrl(ipfsFileUrl);

      // Generate metadata JSON
      const metadataJson = {
        name: name,
        description: description,
        entropie: Math.random().toFixed(6), // Random value between 0-1
        image: ipfsFileUrl, // Link to uploaded file
      };

      // Convert metadata to a Blob for IPFS upload
      const metadataBlob = new Blob([JSON.stringify(metadataJson)], {
        type: "application/json",
      });

      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });

      const metadataResponse = await lighthouse.upload(metadataFile, LIGHTHOUSE_API_KEY);
      const metadataCid = metadataResponse.data.Hash;
      const metadataIpfsUrl = `ipfs://${metadataCid}`;
      setMetadata(metadataIpfsUrl);

      console.log("✅ File Uploaded to IPFS:", ipfsFileUrl);
      console.log("✅ Metadata Uploaded to IPFS:", metadataIpfsUrl);
    } catch (error) {
      console.error("❌ Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Upload File to IPFS (Lighthouse)</h2>

      <input type="text" placeholder="NFT Name" value={name} onChange={(e) => setName(e.target.value)} />
      <br />
      <input type="text" placeholder="NFT Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <br />
      <input type="file" onChange={handleFileChange} />
      <br />
      <button onClick={uploadToLighthouse} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload to IPFS"}
      </button>

      {ipfsUrl && (
        <div>
          <h3>File Uploaded!</h3>
          <p>
            <strong>IPFS CID:</strong> {ipfsUrl}
          </p>
          <p>
            <a href={`https://gateway.lighthouse.storage/ipfs/${ipfsUrl.split("ipfs://")[1]}`} target="_blank" rel="noopener noreferrer">
              View File on IPFS
            </a>
          </p>
        </div>
      )}

      {metadata && (
        <div>
          <h3>Metadata Uploaded!</h3>
          <p>
            <strong>Metadata IPFS CID:</strong> {metadata}
          </p>
          <p>
            <a href={`https://gateway.lighthouse.storage/ipfs/${metadata.split("ipfs://")[1]}`} target="_blank" rel="noopener noreferrer">
              View Metadata on IPFS
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default IpfsUploader;