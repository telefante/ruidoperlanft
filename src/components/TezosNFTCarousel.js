import React, { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import { Pagination } from "swiper/modules"
import SectionContainer from "./sections/SectionContainer"
import placeholderImage from "../assets/placeholder.jpg"
import { Container, Button } from "react-bootstrap"
import WalletConnection from "./WalletConnection"
import { useWallet } from "./WalletContext" // Use WalletContext

const TezosNFTCarousel = () => {
  const { walletAddress, isConnected } = useWallet() // Get wallet state from context
  const [nfts, setNfts] = useState([])

  // const RPC_URL = process.env.GATSBY_TEZOS_RPC_URL;
  const TzKT_API = process.env.GATSBY_TZKT_API_URL
  const COLLECTION_CONTRACT = process.env.GATSBY_TEZOS_CONTRACT
  console.log("TzKT_API:", TzKT_API)
  console.log("COLLECTION_CONTRACT:", COLLECTION_CONTRACT)

  // Debugging wallet state
  useEffect(() => {
    console.log("Wallet Connection State Updated:")
    console.log("Address:", walletAddress)
    console.log("Is Connected:", isConnected)
  }, [walletAddress, isConnected])

  // Fetch NFTs when the wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchNFTs(walletAddress)
    }
  }, [isConnected, walletAddress])

  const fetchNFTs = async walletAddress => {
    const apiUrl = `${TzKT_API}/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`
    console.log("Fetching NFTs from:", apiUrl)
    try {
      console.log("Fetching NFTs for:", walletAddress)

      const response = await fetch(
        `${TzKT_API}v1/tokens/balances?account=${walletAddress}&token.standard=fa2`
      )
      // https://api.tzkt.io/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`
      const data = await response.json()

      console.log("Raw NFT Data:", data)

      if (!Array.isArray(data)) {
        console.error("Unexpected response format", data)
        return
      }

      const filteredNFTs = data.filter(
        nft => nft?.token?.contract?.address === COLLECTION_CONTRACT
      )
      console.log("Filtered NFTs:", filteredNFTs)

      const nftsWithImages = filteredNFTs.filter(
        nft => nft?.token?.metadata?.artifactUri
      )
      console.log("NFTs with Images:", nftsWithImages)

      setNfts(nftsWithImages)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
    }
  }

  return (
    <SectionContainer id="tezos-nft-carousel" title="Your Ruido Perla NFTs">
      <Container className="flex flex-col items-center p-4">
        <WalletConnection />
        {isConnected && walletAddress ? (
          <>
            <h2>Connected as: {walletAddress}</h2>
            <p>
              {nfts.length > 0
                ? `You own ${nfts.length} NFTs`
                : `No NFTs found`}
            </p>

            {nfts.length > 0 ? (
              <Swiper
                modules={[Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                pagination={{ clickable: true }}
              >
                {nfts.map((nft, index) => {
                  const thumbnailUrl =
                    nft.token.metadata.thumbnailUri?.replace(
                      "ipfs://",
                      "https://dweb.link/ipfs/"
                    ) || placeholderImage
                  return (
                    <SwiperSlide key={index}>
                      <div className="p-4 shadow-lg rounded-lg bg-white">
                        <img
                          src={thumbnailUrl}
                          alt={nft.token.metadata?.name || "Unnamed NFT"}
                        />
                        <h3>{nft.token.metadata?.name || "Unnamed NFT"}</h3>
                      </div>
                    </SwiperSlide>
                  )
                })}
              </Swiper>
            ) : (
              <p className="text-center text-gray-500">No NFTs found</p>
            )}

            <Button
              href={`${process.env.GATSBY_OBJKT_COLLECTION_URL}/${COLLECTION_CONTRACT}`}
              target="_blank"
              variant="secondary"
              style={{ marginTop: "1rem",   fontFamily: "var(--primary-font)" }}
            >
              View Full Collection on Objkt
            </Button>
          </>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </Container>
    </SectionContainer>
  )
}

export default TezosNFTCarousel
