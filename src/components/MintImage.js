import { TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import axios from "axios";

// ✅ Replace with your actual NFT.Storage API key
const NFT_STORAGE_API_KEY = "2baeb84d.6af8c38284084b4eaa495eb58a59911f"; 
const IPFS_API = "https://api.nft.storage/upload"; 

export const mintImage = async (wallet, imageFile, contractAddress, rpcUrl) => {
  const tezos = new TezosToolkit(rpcUrl);
  tezos.setProvider({ signer: wallet });

  try {
    console.log("🚀 Uploading image to IPFS...");

    // ✅ Step 1: Convert Image File to FormData for Upload
    const formData = new FormData();
    formData.append("file", imageFile);

    // ✅ Step 2: Upload Image to IPFS via NFT.Storage
    const ipfsResponse = await axios.post(IPFS_API, formData, {
      headers: {
        Authorization: `Bearer ${NFT_STORAGE_API_KEY}`, // ✅ Ensure API key is passed correctly
        "Content-Type": "multipart/form-data",
      },
    });

    if (!ipfsResponse.data || !ipfsResponse.data.value || !ipfsResponse.data.value.cid) {
      throw new Error("IPFS upload failed");
    }

    const ipfsHash = ipfsResponse.data.value.cid;
    const ipfsUrl = `ipfs://${ipfsHash}`;
    console.log(`✅ Image uploaded: ${ipfsUrl}`);

    // ✅ Step 3: Prepare NFT Metadata
    const metadata = {
      name: "Real-Time Generated NFT",
      description: "This NFT was generated dynamically in the DApp.",
      artifactUri: ipfsUrl,
      displayUri: ipfsUrl,
      creators: [await wallet.publicKeyHash()],
      royalties: {
        decimals: 4,
        shares: { [await wallet.publicKeyHash()]: 1000 }, // 10% royalties
      },
      attributes: [{ name: "Generated", value: "True" }],
    };

    console.log("✅ Metadata formatted:", metadata);

    // ✅ Step 4: Convert Metadata to Bytes
    const metadataBytes = char2Bytes(JSON.stringify(metadata));

    // ✅ Step 5: Call the Smart Contract to Mint the NFT
    console.log("🚀 Calling mint function on contract...");
    const contract = await tezos.contract.at(contractAddress);

    const operation = await contract.methods.mint(wallet.publicKeyHash(), metadataBytes).send();
    await operation.confirmation();

    console.log("✅ NFT Minted Successfully: ", operation.hash);
    return operation.hash;
  } catch (error) {
    console.error("❌ Minting failed:", error);
    throw new Error("Minting failed: " + error.message);
  }
};

