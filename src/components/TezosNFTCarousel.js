import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import SectionContainer from "./sections/SectionContainer";
import placeholderImage from "../assets/placeholder.jpg";
import { useStaticQuery, graphql } from "gatsby";
import { Container, Button } from "react-bootstrap";
import WalletConnection from './WalletConnection'; // Import the WalletConnection component

const TezosNFTCarousel = () => {
  const [address, setAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Check if the code is running in the client
  const isClient = typeof window !== "undefined";

  // Fetch contract number from site metadata
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          contractNumber
        }
      }
    }
  `);
  const COLLECTION_CONTRACT = data.site.siteMetadata.contractNumber;

  // Function to fetch NFTs
  const fetchNFTs = async (walletAddress) => {
    try {
      const response = await fetch(`https://api.tzkt.io/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`);
      const data = await response.json();
      const filteredNFTs = data.filter((nft) => nft.token.contract.address === COLLECTION_CONTRACT);
      const nftsWithImages = filteredNFTs.filter((nft) => nft.token.metadata?.artifactUri);
      setNfts(nftsWithImages);
    } catch (error) {
      console.error("Error fetching NFTs: ", error);
    }
  };

  // Connect wallet function
  const connectWallet = () => {
    // Logic to connect wallet
    // This should be implemented in the WalletConnection component
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    // Logic to disconnect wallet
    // This should be implemented in the WalletConnection component
  };

  if (!isClient) {
    return <p>Loading...</p>;
  }

  return (
    <SectionContainer id="tezos-nft-carousel" title="Connect to your Ruido Perla NFTs" background={false} isGridLayout={true}>
      <Container className="flex flex-col items-center p-4">
        {!address ? (
          <>
            <h2>Connect to your Ruido Perla NFTs on Tezos</h2>
            <WalletConnection setAddress={setAddress} setIsConnected={setIsConnected} />
           
          </>
        ) : (
          <>
            <h2>Connected as: {address}</h2>
            <WalletConnection setAddress={setAddress} setIsConnected={setIsConnected} />
            <Swiper modules={[Pagination]} spaceBetween={10} slidesPerView={1} pagination={{ clickable: true }} className="w-full max-w-lg mt-4">
              {nfts.length > 0 ? (
                nfts.map((nft, index) => {
                  const thumbnailUrl = nft.token.metadata.thumbnailUri.replace("ipfs://", "https://dweb.link/ipfs/");
                  return (
                    <SwiperSlide key={index}>
                      <div className="p-4 shadow-lg rounded-lg">
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
                      </div>
                    </SwiperSlide>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">No NFTs found</p>
              )}
            </Swiper>
          </>
        )}
      </Container>

     
    </SectionContainer>
  );
};

export default TezosNFTCarousel;