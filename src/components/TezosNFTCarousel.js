import React, { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import { Pagination } from "swiper/modules"
import SectionContainer from "./sections/SectionContainer"
import placeholderImage from "../assets/placeholder.jpg"
import { Container, Button, Card } from "react-bootstrap"
// import WalletConnection from "./WalletConnection"
import { useWallet } from "./WalletContext" // Use WalletContext
import "./TezosNFTCarousel.css"

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
      fetchNFTsfromCollection(walletAddress)
    }
  }, [isConnected, walletAddress])

  const fetchNFTsfromCollection = async () => {
    const apiUrl = `${TzKT_API}v1/tokens?contract=${COLLECTION_CONTRACT}&limit=200`
    // GET https://api.tzkt.io/v1/tokens?contract=KT1[CollectionAddress]&limit=100

    console.log("Fetching NFTs from:", apiUrl)
    try {
      // console.log("Fetching NFTs for:", walletAddress)

      const response = await fetch(
        apiUrl
      )
      // https://api.tzkt.io/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`
      const data = await response.json()

      console.log("Raw NFT Data:", data)

      if (!Array.isArray(data)) {
        console.error("Unexpected response format", data)
        return
      }

      const nftsWithImages = data.filter(
        nft => nft?.metadata?.artifactUri
      )
      console.log("NFTs with Images:", nftsWithImages)

      setNfts(nftsWithImages)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
    }
  }

  useEffect(() => {
    fetchNFTsfromCollection()
  }, [])

  return (
    <SectionContainer id="tezos-nft-carousel" title="Ruido Perla NFT Collection">
      <Container className="flex flex-col items-center p-4">
      
            <p>
              {nfts.length > 0
                ? `${nfts.length} assets`
                : `No NFTs found`}
            </p>

            {nfts.length > 0 ? (
              <Swiper
                modules={[Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                pagination={{ clickable: true }}
                style={{ width: "100%", height: "100%" , backgroundColor: "transparent"}}
              >
                {nfts.map((nft, index) => {
                  const thumbnailUrl =
                    nft.metadata.thumbnailUri?.replace(
                      "ipfs://",
                      "https://dweb.link/ipfs/"
                    ) || placeholderImage
                  return (
                    <SwiperSlide key={index}>
                      <div className="d-flex align-items-center">
                        <img
                          src={thumbnailUrl}
                          alt={nft.metadata?.name || "Unnamed NFT"}
                          style={{
                            maxWidth: "400px",
                            maxHeight: "400px",
                            marginRight: "20px",
                          }}
                        />

                        {nft.metadata?.attributes && (
                          <Card style={{ width: "12rem", margin: "10px" }}>
                            <div className="card-body custom-card-body">
                              <h3 className="card-title custom-card-title">
                              {nft.metadata?.name || "Unnamed NFT"}
                              </h3>
                              <ul className="list-group list-group-flush custom-list-group">
                                {nft.metadata.attributes.map((attr, i) => (
                                  <li
                                    key={i}
                                    className="list-group-item custom-list-item"
                                  >
                                    <strong>{attr.name}:</strong> {attr.value}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </Card>
                        )}
                      </div>
                   
                      <p>
                        {nft.metadata?.description || "No description available"}
                      </p>
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
         
           
      </Container>
    </SectionContainer>
  )
}

export default TezosNFTCarousel
