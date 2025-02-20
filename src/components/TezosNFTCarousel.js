import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import SectionContainer from "./sections/SectionContainer";
import placeholderImage from "../assets/placeholder.jpg";
import { useStaticQuery, graphql } from "gatsby";

// ✅ Lazy-load React Bootstrap components to prevent SSR issues
let Container, Button;
if (typeof window !== "undefined") {
  Container = require("react-bootstrap/Container").default;
  Button = require("react-bootstrap/Button").default;
}

// ✅ Ensure Beacon SDK only runs in the browser
const isBrowser = typeof window !== "undefined";

let DAppClient, BeaconEvent;
if (isBrowser) {
  ({ DAppClient, BeaconEvent } = require("@airgap/beacon-sdk"));
}

const TezosNFTCarousel = () => {
  const [isClient, setIsClient] = useState(false);
  const [address, setAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // ✅ Use useRef to store DAppClient (to avoid multiple instances)
  const dAppClientRef = useRef(null);

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

  useEffect(() => {
    if (isBrowser) {
      setIsClient(true);
    }
  }, []);

  useEffect(() => {
    if (!isClient || !isBrowser) return;

    // ✅ Initialize Beacon SDK only once
    if (!dAppClientRef.current) {
      dAppClientRef.current = new DAppClient({ name: "Ruido Perla NFT Collection" });

      // ✅ Subscribe to active account events
      dAppClientRef.current.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (account) => {
        console.log("Beacon Account Set:", account.address);
        setAddress(account.address);
        setIsConnected(true);
        fetchNFTs(account.address);
      });
    }

    const setupWallet = async () => {
      const activeAccount = await dAppClientRef.current.getActiveAccount();
      if (activeAccount) {
        console.log("Already connected:", activeAccount.address);
        setAddress(activeAccount.address);
        setIsConnected(true);
        fetchNFTs(activeAccount.address);
      } else {
        console.log("No active account. User needs to connect.");
      }
    };

    setupWallet();
  }, [isClient]);

  const connectWallet = async () => {
    try {
      if (!isBrowser) return;
      
      const permissions = await dAppClientRef.current.requestPermissions();
      console.log("New connection:", permissions.address);
      setAddress(permissions.address);
      setIsConnected(true);
      fetchNFTs(permissions.address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("An error occurred while connecting to the wallet. Please try again.");
    }
  };

  const disconnectWallet = async () => {
    setAddress(null);
    setNfts([]);
    setIsConnected(false);
    console.log("Wallet disconnected");
  };

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

  if (!isClient) {
    return <p>Loading...</p>;
  }

  return (
    <SectionContainer id="tezos-nft-carousel" title="Connect to your Ruido Perla NFTs" background={false} isGridLayout={true}>
      <Container className="flex flex-col items-center p-4">
        {!address ? (
          <>
            <h2>Connect to your Ruido Perla NFTs</h2>
            <Button
              style={{
                fontFamily: 'var(--primary-font)',
                fontStyle: 'italic',
                fontSize: '1.6rem',
                fontWeight: 'bold',
                backgroundColor: isConnected ? 'green' : 'blue',
                color: 'white',
              }}
              variant="primary"
              onClick={connectWallet}
            >
              {isConnected ? "Connected" : "Connect through your Tezos Wallet"}
            </Button>
          </>
        ) : (
          <>
            <h2>Connect to your Ruido Perla NFTs</h2>
            <Button
              style={{ fontFamily: 'var(--primary-font)', fontStyle: 'italic', fontSize: '1.2rem' }}
              variant="danger"
              onClick={disconnectWallet}
              className="mt-4"
            >
              Disconnect Wallet
            </Button>
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