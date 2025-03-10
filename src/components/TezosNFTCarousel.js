import React, { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation" // Import navigation styles
import { Pagination, Navigation } from "swiper/modules" // Import Navigation module
import SectionContainer from "./sections/SectionContainer"
import placeholderImage from "../assets/placeholder.jpg"
import { Button, Card, Row, Col, Modal, Container } from "react-bootstrap"
// import WalletConnection from "./WalletConnection"
import { useWallet } from "./WalletContext" // Use WalletContext
import "./TezosNFTCarousel.css"
import styled from "styled-components"

const DescriptionText = styled.p`
  max-width: 50vw;
  text-align: justify;
  font-size: 1.0rem;
  @media (max-width: 768px) {
    max-width: 90vw;
  }
`

const TezosNFTCarousel = () => {
  const { walletAddress, isConnected } = useWallet() // Get wallet state from context
  const [nfts, setNfts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalImage, setModalImage] = useState("")
  const [selectedNft, setSelectedNft] = useState(null) // new state

  // const RPC_URL = process.env.GATSBY_TEZOS_RPC_URL;
  const TzKT_API = process.env.GATSBY_TZKT_API_URL
  const COLLECTION_CONTRACT = process.env.GATSBY_TEZOS_CONTRACT
  const OBJKT_TOKEN_URL = process.env.GATSBY_OBJKT_TOKEN_URL
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

      const response = await fetch(apiUrl)
      // https://api.tzkt.io/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`
      const data = await response.json()

      console.log("Raw NFT Data:", data)

      if (!Array.isArray(data)) {
        console.error("Unexpected response format", data)
        return
      }

      const nftsWithImages = data.filter(nft => nft?.metadata?.artifactUri)
      console.log("NFTs with Images:", nftsWithImages)

      setNfts(nftsWithImages)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
    }
  }

  useEffect(() => {
    fetchNFTsfromCollection()
  }, [])

  const openModal = nft => {
    setModalImage(
      nft.metadata.displayUri?.replace("ipfs://", "https://dweb.link/ipfs/") ||
        placeholderImage
    )
    setSelectedNft(nft) // Store the selected NFT
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalImage("")
    setSelectedNft(null) // Clear the selected NFT
  }

  return (
    <SectionContainer id="tezos-nft-carousel">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={3}>
          <h2 className="simulation-title">Collection</h2>
        </Col>
      </Row>

      {/* <Container className="flex flex-col items-center p-4"> */}
      {/* <Container flex > */}
      {/* <p>{nfts.length > 0 ? `${nfts.length} assets` : `No NFTs found`}</p> */}

      {/* </Container> */}
      {nfts.length > 0 ? (
        <Container>
          <Swiper
            modules={[Pagination, Navigation]} // Add Navigation to modules
            spaceBetween={10}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation={true} // Enable navigation arrows
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            }}
          >
            {nfts.map((nft, index) => {
              const thumbnailUrl =
                nft.metadata.thumbnailUri?.replace(
                  "ipfs://",
                  "https://dweb.link/ipfs/"
                ) || placeholderImage

              // Create a function to handle the click event
              const handleImageClick = () => {
                openModal(nft)
              }

              return (
                <SwiperSlide key={index}>
                  <Row className="align-items-center mb-4">
                    <DescriptionText>
                      <p>
                        👉 Ruido Perla is more than a collection—it is an
                        evolving digital extension of an installation. These
                        generative NFTs are not just static images but keys
                        unlocking access to a ongoing process.
                      </p>
                    </DescriptionText>
                  </Row>
                  {/* <Container className="d-flex align-items-center"> */}
                  <Row>
                    <Col>
                      <h2>{nft.metadata?.name || "Unnamed NFT"}</h2>
                      <img
                        src={thumbnailUrl}
                        alt={nft.metadata?.name || "Unnamed NFT"}
                        style={{
                          maxWidth: "80%",
                          minWidth: "200px",
                          // maxHeight: ",
                          marginRight: "20px",
                          cursor: "pointer", // Add cursor pointer
                        }}
                        onClick={handleImageClick} // Call the new function
                      />
                    </Col>
                    <Col>
                      {nft.metadata?.attributes && (
                        <Card
                          noborder
                          style={{
                            width: "18rem",
                            margin: "10px",
                            backgroundColor: "transparent",
                          }}
                        >
                          <div className="card-body custom-card-body">
                            <h3 className="card-title custom-card-title">
                              attributes
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
                    </Col>
                  </Row>
                  {/* </Container> */}
                  <Row mt-8 centered>
                    <h3>
                      Rarity:{" "}
                      {nft.metadata.attributes.find(
                        attr => attr.name === "Rarity"
                      )?.value || "No rarity available"}
                    </h3>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <DescriptionText>
                        {nft.metadata?.description ||
                          "No description available"}
                      </DescriptionText>
                    </div>
                  </Row>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <DescriptionText>
                      <p>
                        🟢 <strong>Legendary (1/1)</strong> → Singular moments
                        of entropy, never repeated. 🔵{" "}
                        <strong>Rare (Limited Editions)</strong> → Echoes of
                        complexity, held in scarce iterations. ⚪{" "}
                        <strong>Common (Small Batch)</strong> → A fleeting
                        glimpse into the infinite, yet still finite. Holding one
                        grants you private access to an exclusive generative
                        simulation, where landscapes reshape and dissolve in
                        real time. Limited Supply. No Second Chances. 👉{" "}
                      </p>
                      <Row>
                        <Button
                          href={`${OBJKT_TOKEN_URL}/${COLLECTION_CONTRACT}/${nft.tokenId}`}
                          target="_blank"
                          variant="primary"
                          style={{
                            fontFamily: "var(--primary-font)",
                            fontStyle: "italic",
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                            maxWidth: "200px",
                          }}
                        >
                          Collect now on Objkt
                        </Button>
                      </Row>
                    </DescriptionText>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
          <Button
            m-4
            href={`${process.env.GATSBY_OBJKT_COLLECTION_URL}/${COLLECTION_CONTRACT}`}
            target="_blank"
            variant="secondary"
            style={{
              marginTop: "1rem",
              fontFamily: "var(--primary-font)",
              maxWidth: "200px",
              marginLeft: "20px",
            }}
          >
            View Full Collection on Objkt
          </Button>
        </Container>
      ) : (
        <p className="text-center text-gray-500">No NFTs found</p>
      )}

      {/* </Container> */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Body>
          <img src={modalImage} alt="NFT" style={{ width: "100%" }} />
        </Modal.Body>
        <Modal.Footer>
          {selectedNft && (
            <>
              {console.log("Buy Button - selectedNft:", selectedNft)}{" "}
              {/* Log here */}
              <Button
                style={{
                  fontFamily: "var(--primary-font)",
                  fontSize: "1.5rem",
                  fontVariant: "italic",
                  fontWeight: "bold",
                }}
                variant="primary"
                href={`${OBJKT_TOKEN_URL}/${COLLECTION_CONTRACT}/${selectedNft.tokenId}`}
              >
                Buy
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </SectionContainer>
  )
}

export default TezosNFTCarousel
