import { TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import axios from "axios";
import { NFTStorage } from "nft.storage";

// ✅ Replace with your actual NFT.Storage API key
const NFT_STORAGE_API_KEY = process.env.GATSBY_NFT_STORAGE_API_KEY;
const IPFS_API = "https://api.nft.storage/upload"; 
console.log("NFT_STORAGE_API_KEY:", process.env.GATSBY_NFT_STORAGE_API_KEY);

if (!NFT_STORAGE_API_KEY) {
  throw new Error("Missing NFT_STORAGE_API_KEY in environment variables");
}


export const uploadToNFTStorage = async (imageFile) => {
  try {
    console.log("🚀 Uploading image to IPFS...");
    console.log(NFT_STORAGE_API_KEY);
    // ✅ Ensure the API key is properly passed as a string
    if (!NFT_STORAGE_API_KEY || typeof NFT_STORAGE_API_KEY !== "string") {
      throw new Error("❌ API Key is missing or not a string.");
    }

    const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });

    // ✅ Upload file to NFT.Storage
    const cid = await client.storeBlob(imageFile);
    const ipfsUrl = `ipfs://${cid}`;

    console.log(`✅ Image uploaded to IPFS: ${ipfsUrl}`);
    return ipfsUrl;
  } catch (error) {
    console.error("❌ IPFS Upload Failed:", error);
    throw new Error("IPFS Upload Failed: " + error.message);
  }
};

export const storeMetadataOnIPFS = async (imageIpfsUrl, walletAddress) => {
  try {
    console.log("🚀 Uploading metadata to IPFS...");

    const metadata = {
      name: "Real-Time Generated NFT",
      description: "This NFT was dynamically generated in the DApp.",
      artifactUri: imageIpfsUrl,
      displayUri: imageIpfsUrl,
      creators: [walletAddress],
      royalties: {
        decimals: 4,
        shares: { [walletAddress]: 1000 }, // 10% royalties
      },
      attributes: [{ name: "Generated", value: "True" }],
    };

    const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });
    const metadataCid = await client.storeBlob(new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    
    const metadataIpfsUrl = `ipfs://${metadataCid}`;
    console.log(`✅ Metadata uploaded to IPFS: ${metadataIpfsUrl}`);

    return metadataIpfsUrl;
  } catch (error) {
    console.error("❌ Metadata Upload Failed:", error);
    throw new Error("Metadata Upload Failed: " + error.message);
  }
};

export const mintImage = async (wallet, imageFile, contractAddress, rpcUrl) => {
  const tezos = new TezosToolkit(rpcUrl);
  tezos.setProvider({ signer: wallet });

  try {
    // Upload the image to IPFS
    const imageIpfsUrl = await uploadToNFTStorage(imageFile);

    // Store metadata on IPFS
    const metadataIpfsUrl = await storeMetadataOnIPFS(imageIpfsUrl, await wallet.publicKeyHash());

    // Call the mint function on the contract
    const contract = await tezos.contract.at(contractAddress);
    const operation = await contract.methods.mint(wallet.publicKeyHash(), char2Bytes(JSON.stringify({ artifactUri: metadataIpfsUrl }))).send();
    
    await operation.confirmation();
    console.log("✅ NFT Minted Successfully: ", operation.hash);
    return operation.hash;
  } catch (error) {
    console.error("❌ Minting failed:", error);
    throw new Error("Minting failed: " + error.message);
  }
};

