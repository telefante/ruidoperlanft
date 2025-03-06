import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import SectionContainer from "./sections/SectionContainer";
import placeholderImage from "../assets/placeholder.jpg";
import { useStaticQuery, graphql } from "gatsby";
import { Container, Row, Button } from "react-bootstrap";
import WalletConnection from './WalletConnection'; // Import the WalletConnection component

const TezosNFTCarousel = () => {
  const [address, setAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const isClient = typeof window !== "undefined";

  // Fetch contract number and RPC URL from site metadata
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          contractNumber
          rpcUrl
        }
      }
    }
  `);
  const COLLECTION_CONTRACT = process.env.GATSBY_TEZOS_CONTRACT;  //data.site.siteMetadata.contractNumber;
  const RPC_URL = process.env.GATSBY_TEZOS_RPC_URL; //data.site.siteMetadata.rpcUrl;
  const OBJKT_COLLECTION_URL = process.env.GATSBY_OBJKT_COLLECTION_URL + "/" + COLLECTION_CONTRACT;

  // Function to fetch NFTs
  const fetchNFTs = async (walletAddress) => {
    try {
      // Fetch token balances for the given wallet address
      // The query parameter ?account=<walletAddress> filters the response to only include tokens owned by the given wallet
      // The query parameter ?token.standard=fa2 filters the response to only include tokens with the FA2 standard
      const response = await fetch(`${RPC_URL}/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`);
      const data = await response.json();
      const filteredNFTs = data.filter((nft) => nft.token.contract.address === COLLECTION_CONTRACT);
      const nftsWithImages = filteredNFTs.filter((nft) => nft.token.metadata?.artifactUri);
      setNfts(nftsWithImages);
    } catch (error) {
      console.error("Error fetching NFTs: ", error);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchNFTs(address);
    }
  }, [isConnected, address]);

  if (!isClient) {
    return <p>Loading...</p>;
  }

  return (
    <SectionContainer id="tezos-nft-carousel" title="Your Ruido Perla NFTs" background={false} isGridLayout={true}>
      <Container className="flex flex-col items-center p-4">
        <WalletConnection setAddress={setAddress} setIsConnected={setIsConnected} isConnected={isConnected} />
        {isConnected && address && (
          <>
            <h2>Connected as: {address}</h2>
            <p>{nfts.length > 0 ? `You own ${nfts.length} NFTs` : `No NFTs found`}</p>

            <Swiper modules={[Pagination]} spaceBetween={10} slidesPerView={1} pagination={{ clickable: true }} className="w-full max-w-lg mt-4">
              {nfts.length > 0 ? (
                nfts.map((nft, index) => {
                  const thumbnailUrl = nft.token.metadata.thumbnailUri.replace("ipfs://", "https://dweb.link/ipfs/");
                  const objktUrl = `https://objkt.com/asset/${COLLECTION_CONTRACT}/${nft.token.id}`;

                  return (
                    <SwiperSlide key={index}>
                      <div className="p-4 shadow-lg rounded-lg bg-white">
                        <img
                          src={thumbnailUrl}
                          alt={nft.token.metadata.name}
                          className="w-full h-64 object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeholderImage;
                          }}
                        />
                        <h3 className="text-center mt-2 text-lg font-semibold">{nft.token.metadata.name || "Unnamed NFT"}</h3>

                        {/* NFT Attributes */}
                        {nft.token.metadata.attributes && (
                          <div className="text-sm mt-2 p-2 bg-gray-100 rounded">
                            <h4 className="font-semibold">Attributes:</h4>
                            <ul>
                              {nft.token.metadata.attributes.map((attr, attrIndex) => (
                                <li key={attrIndex}>{attr.name}: {attr.value}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Buy Button */}
                        <div className="flex justify-center mt-4">
                          <Button href={objktUrl} target="_blank" variant="primary">
                            Buy Here
                          </Button>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">No NFTs found</p>
              )}
            </Swiper>

            {/* View Collection on Objkt Button */}
            <div className="mt-6">
              <Button href={OBJKT_COLLECTION_URL} target="_blank" variant="outline-primary">
                View Full Collection on Objkt
              </Button>
            </div>
          </>
        )}
      </Container>
    </SectionContainer>
  );
};

export default TezosNFTCarousel;