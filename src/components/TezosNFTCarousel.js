import React, { useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation" // Import navigation styles
import { Pagination, Navigation } from "swiper/modules" // Import Navigation module
import placeholderImage from "../assets/placeholder.jpg"
import { Button, Card, Row, Col, Modal, Container } from "react-bootstrap"
// import WalletConnection from "./WalletConnection"
import { useWallet } from "./WalletContext" // Use WalletContext
import "./TezosNFTCarousel.css"
import styled from "styled-components"

const DescriptionText = styled.p`
  max-width: 50vw;
  text-align: justify;
  font-size: 1rem;
  @media (max-width: 768px) {
    max-width: 90vw;
  }
`

// Custom styles for navigation buttons
const NavigationButton = styled.div`
  color: white; /* Change the color here */
  &.swiper-button-next,
  &.swiper-button-prev {
    color: var(--primary-color);
    &:after {
      font-size: 2rem;
      font-weight: bold;
    }
  }

  /* Hide pagination bullets */
  .swiper-pagination-bullet {
    display: none;
  }
`

const SwiperContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: transparent;

  @media (max-width: 768px) {
    width: 100%; /* Make Swiper full width on mobile */
  }
`

const SlideCounter = styled.div`
  position: relative;
  tops: 0px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 2rem;
  font-weight: bold;
  font-family: var(--primary-font);
  z-index: 10;
`

const TezosNFTCarousel = () => {
  // const { walletAddress, isConnected } = useWallet() // Get wallet state from context
  const [nfts, setNfts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalImage, setModalImage] = useState("")
  const [selectedNft, setSelectedNft] = useState(null) // new state
  const [currentSlide, setCurrentSlide] = useState(1)
  const [thumbnailCache, setThumbnailCache] = useState({}) // Cache for thumbnails
  const [resolvedThumbnails, setResolvedThumbnails] = useState({}); // Store resolved thumbnail URLs
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileCheck = () => {
      setIsMobile(window.innerWidth <= 768); // Example: Adjust the breakpoint as needed
    };

    mobileCheck(); // Check on initial load
console.log("isMobile:", isMobile)
    window.addEventListener("resize", mobileCheck); // Check on window resize

    return () => {
      window.removeEventListener("resize", mobileCheck); // Clean up the event listener
    };
  }, []);

  // const RPC_URL = process.env.GATSBY_TEZOS_RPC_URL;
  const TzKT_API = process.env.GATSBY_TZKT_API_URL
  const COLLECTION_CONTRACT = process.env.GATSBY_RUIDOPERLANFT_CONTRACT
  const OBJKT_TOKEN_URL = process.env.GATSBY_OBJKT_TOKEN_URL
  // console.log("TzKT_API:", TzKT_API)
  // console.log("COLLECTION_CONTRACT:", COLLECTION_CONTRACT)


  const fetchNFTsfromCollection = async () => {
    if (!('caches' in window)) {
      console.warn("Cache API not supported in this browser.");
      // Fallback: Fetch data without caching
      const apiUrl = `${TzKT_API}v1/tokens?contract=${COLLECTION_CONTRACT}&limit=${isMobile ? 25 : 104}`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected response format", data);
          return;
        }

        const nftsWithImages = data.filter(nft => nft?.metadata?.artifactUri);
        setNfts(nftsWithImages);
        return;
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        return;
      }
    }

    const cacheName = "nftsCache";
    const cache = await caches.open(cacheName);

    // Check if data is already cached
    const cachedResponse = await cache.match("nftsData");
    if (cachedResponse) {
      console.log("Using cached NFTs data from Cache Storage.");
      const cachedData = await cachedResponse.json();
      setNfts(cachedData.nfts);
      setThumbnailCache(cachedData.thumbnailCache);
      return;
    }

    // const apiUrl = `${TzKT_API}v1/tokens?contract=${COLLECTION_CONTRACT}&limit=104`;
    const apiUrl = `${TzKT_API}v1/tokens?contract=${COLLECTION_CONTRACT}&limit=${isMobile ? 25 : 104}`;
    console.log("Fetching NFTs from:", apiUrl);
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Unexpected response format", data);
        return;
      }

      const nftsWithImages = data.filter(nft => nft?.metadata?.artifactUri);

      // Cache thumbnail URLs and binaries
      const newThumbnailCache = {};
      const promises = nftsWithImages.map(async nft => {
        const thumbnailUrl =
          nft.metadata.thumbnailUri?.replace("ipfs://", "https://dweb.link/ipfs/") ||
          placeholderImage;

        try {
          const imageResponse = await fetch(thumbnailUrl);
          const blob = await imageResponse.blob();

          // Store the image in Cache Storage
          const imageCacheKey = `thumbnail-${nft.tokenId}`;
          await cache.put(imageCacheKey, new Response(blob));

          newThumbnailCache[nft.tokenId] = {
            url: thumbnailUrl,
            cacheKey: imageCacheKey, // Reference to the cache key
          };
        } catch (error) {
          console.error(`Error fetching thumbnail for tokenId ${nft.tokenId}:`, error);
          newThumbnailCache[nft.tokenId] = { url: thumbnailUrl, cacheKey: null };
        }
      });

      await Promise.all(promises);

      // Save data to state
      setThumbnailCache(newThumbnailCache);
      setNfts(nftsWithImages);

      // Cache metadata in Cache Storage
      const metadata = new Response(
        JSON.stringify({ nfts: nftsWithImages, thumbnailCache: newThumbnailCache })
      );
      await cache.put("nftsData", metadata);
      console.log("Saved NFTs data to Cache Storage.");
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  }

  useEffect(() => {
    fetchNFTsfromCollection()
  }, [])

  useEffect(() => {
    const resolveThumbnails = async () => {
      const resolved = {};
      for (const nft of nfts) {
        const thumbnailUrl = nft.metadata.thumbnailUri?.replace("ipfs://", "https://dweb.link/ipfs/") || placeholderImage;

        if ('caches' in window) {
          // If caches API is available, try to fetch from cache
          const thumbnailData = thumbnailCache[nft.tokenId];
          if (thumbnailData?.cacheKey) {
            const cachedResponse = await caches.match(thumbnailData.cacheKey);
            if (cachedResponse) {
              const blob = await cachedResponse.blob();
              resolved[nft.tokenId] = URL.createObjectURL(blob);
            } else {
              resolved[nft.tokenId] = thumbnailData?.url || placeholderImage;
            }
          } else {
            resolved[nft.tokenId] = thumbnailData?.url || placeholderImage;
          }
        } else {
          // If caches API is not available, directly use the thumbnail URL
          resolved[nft.tokenId] = thumbnailUrl;
        }
      }
      setResolvedThumbnails(resolved);
    };

    if (nfts.length > 0) {
      resolveThumbnails();
    }
  }, [nfts, thumbnailCache]);

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

  const handleSlideChange = swiper => {
    let slideNumber = swiper.realIndex + 1;
    if (slideNumber > nfts.length) {
      slideNumber = 1;
    } else if (slideNumber < 1) {
      slideNumber = nfts.length;
    }
    setCurrentSlide(slideNumber);
  }

  return (
    <Container className="flex flex-col items-center p-4">
      {nfts.length > 0 ? (
        <Container className="flex flex-col items-center p-0">
          <SwiperContainer>
          <SlideCounter>
              {currentSlide} / {nfts.length}
            </SlideCounter>
            <Swiper
              modules={[Pagination, Navigation]} // Add Navigation to modules
              spaceBetween={10}
              slidesPerView={1}
              loop={true}
              pagination={{
                clickable: true,
                renderBullet: () => {
                  return `<span class="swiper-pagination-bullet"></span>`
                },
              }}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }} // Enable navigation arrows and specify custom classes
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
              }}
              simulateTouch={true} // Enable touch simulation
              touchEventsTarget="container" // Ensure events are captured within the container
              onSlideChange={handleSlideChange}
            >
              <NavigationButton className="swiper-button-prev" />
              <NavigationButton className="swiper-button-next" />
              {nfts.map((nft, index) => {
                const thumbnailUrl =
                  resolvedThumbnails[nft.tokenId] || placeholderImage;

                // Create a function to handle the click event
                const handleImageClick = () => {
                  openModal(nft);
                };

                return (
                  <SwiperSlide key={index}>
                    <Row>
                      <Col>
                        <h2>{nft.metadata?.name || "Unnamed NFT"}</h2>
                        <img
                          src={thumbnailUrl}
                          alt={nft.metadata?.name || "Unnamed NFT"}
                          style={{
                            maxWidth: "80%",
                            minWidth: "200px",
                            marginRight: "20px",
                            cursor: "pointer", // Add cursor pointer
                          }}
                          onClick={handleImageClick} // Call the new function
                        />
                      </Col>
                      <Col className="d-none d-md-block">
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
                    <Row mt-8 centered>
                      <h3>
                        Rarity:{" "}
                        {nft.metadata.attributes.find(
                          attr => attr.name === "Rarity"
                        )?.value || "No rarity available"}
                      </h3>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <DescriptionText>
                          {nft.metadata?.description ||
                            "No description available"}
                        </DescriptionText>
                      </div>
                    </Row>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Row>
                        <Button
                          href={`${OBJKT_TOKEN_URL}${COLLECTION_CONTRACT}/${nft.tokenId}`}
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
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          
          </SwiperContainer>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DescriptionText>
              <Row className="align-items-center mb-4">
                👉 Ruido Perla is more than a collection—it is an evolving
                digital extension of an installation. These generative NFTs are
                not just static images but keys unlocking access to a ongoing
                process.
              </Row>
              🟢
              <strong>Legendary (1/1)</strong> → Singular moments of entropy -
              it gives you some secret powers
              <br /> 🔵
              <strong>Rare (very Limited Editions)</strong> → Echoes of
                complexity, held in scarce iterations.
              <br /> ⚪<strong>Common (Small Batch)</strong> → A fleeting
              glimpse into the infinite, yet still finite. Holding one grants
              you private access to an exclusive generative simulation, where
              landscapes reshape and dissolve in real time. Limited Supply. No
              Second Chances. 👉
              <Row>
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
              </Row>
            </DescriptionText>
          </div>
        </Container>
      ) : (
        <p className="text-center text-gray-500">No NFTs found</p>
      )}
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
                href={`${OBJKT_TOKEN_URL}${COLLECTION_CONTRACT}/${selectedNft.tokenId}`}
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
    </Container>
  )
}

export default TezosNFTCarousel
