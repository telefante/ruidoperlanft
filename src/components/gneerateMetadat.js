const generateMetadata = async () => {
    const timestamp = new Date().toISOString()
    // Ensure perlinSettings is defined with safe default values
    const safePerlinSettings = perlinSettings || {
      amplitude: 0,
      scale: 0,
      frequency: 0,
      octaves: 0,
    }

    try {
      // Create a placeholder image blob
      const imageBlob = new Blob(["Temporary Image Data"], {
        type: "image/png",
      })
      const imageArrayBuffer = await imageBlob.arrayBuffer()
      const imageUint8Array = new Uint8Array(imageArrayBuffer)

      // Generate IPFS CID for the estimated image
      const predictedImageCid = await ipfsOnlyHash.of(imageUint8Array)

      // Maintain the original metadata structure
      const metadata = JSON.stringify({
        artifactUri: `ipfs://${predictedImageCid}`,
        name: `RuidoPerla#${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
        description: `You found a 1/1 Ruido Perla NFT. 
      It is a pearl in noise—Perlin noise, Ruido Perla.
      A landscape in flux, shifting with Amplitude ${safePerlinSettings.amplitude}, shaped by Scale ${safePerlinSettings.scale},
      whispering in the frequencies of endless recombination.
      This NFT is not a static image—it is a key to a living simulation, evolving in real-time at ruidoperlanft.netlify.app.
      A fragment of the infinite, seen once, then lost to the next wave.`,
        minter: walletAddress,
        mintingTool: "http://ruidoperlanft.netlify.com",
        creators:
          CREATOR !== walletAddress
            ? [CREATOR, walletAddress]
            : [walletAddress],
        decimals: 0,
        symbol: "RPNFTv2",
        rights: "No License / All Rights Reserved",
        date: timestamp,
        attributes: [
          { name: "Amplitude", value: safePerlinSettings.amplitude.toString() },
          { name: "Scale", value: safePerlinSettings.scale.toString() },
          { name: "Frequency", value: safePerlinSettings.frequency.toString() },
          { name: "Octaves", value: safePerlinSettings.octaves.toString() },
        ],
        royalties: {
          decimals: 4,
          shares: {
            [walletAddress]: 500,
            [CREATOR]: 500,
          },
        },
        tags: ["nature", "simulation", "real-time", "poetry"],
        displayUri: `ipfs://${predictedImageCid}`,
        thumbnailUri: `ipfs://${predictedImageCid}`,
      })

      const metadataUint8Array = new TextEncoder().encode(metadata)

      // Generate IPFS CID for the metadata
      const predictedMetadataCid = await ipfsOnlyHash.of(metadataUint8Array)

      const generatedMetadata = JSON.parse(metadata)
      generatedMetadata.metadataUri = `ipfs://${predictedMetadataCid}`

      setMetadataJson(generatedMetadata)
      setShowMetadataPreview(true)
    } catch (error) {
      console.error("❌ Error generating estimated IPFS CID:", error)
    }
  }