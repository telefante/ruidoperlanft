import { TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
// import axios from "axios";
import { NFTStorage, File, Blob } from "nft.storage";


// ✅ Replace with your actual NFT.Storage API key
// const NFT_STORAGE_API_KEY = process.env.GATSBY_NFT_STORAGE_API_KEY;
const NFT_STORAGE_API_KEY = '2baeb84d.6af8c38284084b4eaa495eb58a59911f'
// const IPFS_API = "https://api.nft.storage/upload/"; 
console.log("NFT_STORAGE_API_KEY:", NFT_STORAGE_API_KEY);

if (!NFT_STORAGE_API_KEY) {
  throw new Error("Missing NFT_STORAGE_API_KEY in environment variables");
}

if (!NFT_STORAGE_API_KEY || typeof NFT_STORAGE_API_KEY !== "string") {
  console.error("❌ API Key is missing or malformed.");
  throw new Error("NFT_STORAGE_API_KEY is missing or not correctly set in .env.");
}


export const uploadToNFTStorage = async (imageFile) => {
  try {
    console.log("🚀 Uploading image to IPFS...");
    
    console.log("🛠 NFT.Storage Request Headers:", {
      Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
    });

    console.log(NFT_STORAGE_API_KEY);
    // ✅ Ensure the API key is properly passed as a string
    if (!NFT_STORAGE_API_KEY || typeof NFT_STORAGE_API_KEY !== "string") {
      throw new Error("❌ API Key is missing or not a string.");
    }

    const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });

    // ✅ Upload file to NFT.Storage
   
     // ✅ Ensure the Blob is converted into a File with a name
    //  const blob = new File([imageFile], "generated-nft.png", { type: "image/png" });
    //  console.log("blob:", blob);

    
    const cid = await client.store(imageFile);
   
    console.log("cid:", cid);
    const ipfsUrl = `ipfs://${cid}`;

    console.log(`✅ Image uploaded to IPFS: ${ipfsUrl}`);
    return ipfsUrl;
  } catch (error) {
    console.error("❌ IPFS Upload Failed:", error);
    throw new Error("IPFS Upload Failed: " + error.message);
  }
};

export const storeExampleNFT = async (imageBlob) => {
  try {
    // Create the NFT metadata object
    const nft = {
      // image: imageBlob, // Use the image Blob as the `image` field
      name: "Storing the World's Most Valuable Virtual Assets with NFT.Storage",
      description: "The metaverse is here. Where is it all being stored?",
      properties: {
        type: "blog-post",
        origins: {
          http: "https://blog.nft.storage/posts/2021-11-30-hello-world-nft-storage/",
          ipfs: "ipfs://bafybeieh4gpvatp32iqaacs6xqxqitla4drrkyyzq6dshqqsilkk3fqmti/blog/post/2021-11-30-hello-world-nft-storage/"
        },
        authors: [{ name: "David Choi" }],
        content: {
          "text/markdown": "The last year has witnessed the explosion of NFTs onto the world's mainstage. From fine art to collectibles to music and media, NFTs are quickly demonstrating just how quickly grassroots Web3 communities can grow, and perhaps how much closer we are to mass adoption than we may have previously thought."
        }
      }
    };

   

    // Create a new NFTStorage client
    const client = new NFTStorage({ token: NFT_STORAGE_API_KEY });
    const someData = new Blob(["hello world"])
    const cid = await client.storeBlob(someData);
    console.log("cid:", cid);

    const metadata = await client.store({
      name: "NFT Name",
      description: "NFT Description",
      image: imageBlob,
    });

    // Store the NFT metadata
    // const metadata = await client.store(nft2);

    console.log('NFT data stored!');
    console.log('Metadata URI: ', metadata.url);

    return metadata.url; // Return the metadata URL if needed
  } catch (error) {
    console.error("❌ NFT Upload Failed:", error);
    throw new Error("NFT Upload Failed: " + error.message);
  }
};

export const mintImage = async (wallet, blob, contractAddress, rpcUrl) => {
  const tezos = new TezosToolkit(rpcUrl);
  tezos.setProvider({ signer: wallet });

  try {
    // Upload the image to IPFS
    // const imageIpfsUrl = await uploadToNFTStorage(blob);

    // Store metadata on IPFS
    const metadataIpfsUrl = await storeExampleNFT(blob);

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

