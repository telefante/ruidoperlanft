import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import SectionContainer from "./sections/SectionContainer";
import placeholderImage from '../assets/placeholder.jpg';
import { useStaticQuery, graphql } from "gatsby";
import './styles/Tezos.css';
// ✅ Lazy-load React Bootstrap components to prevent SSR issues
let Container, Button;
if (typeof window !== "undefined") {
  Container = require("react-bootstrap/Container").default;
  Button = require("react-bootstrap/Button").default;
}

const TezosNFTCarousel = () => {
  const [isClient, setIsClient] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [Tezos, setTezos] = useState(null);
  const [address, setAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

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
  
  const COLLECTION_CONTRACT = data.site.siteMetadata.contractNumber; // Use the fetched contract number

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    import("@taquito/taquito").then(({ TezosToolkit }) => {
      const tezosInstance = new TezosToolkit("https://mainnet.api.tez.ie");
      setTezos(tezosInstance);
    });

    import("@taquito/beacon-wallet").then(({ BeaconWallet }) => {
      const walletInstance = new BeaconWallet({ name: "Tezos NFT Viewer" });
      setWallet(walletInstance);
    });
  }, [isClient]);

  useEffect(() => {
    const setupWallet = async () => {
      if (!wallet || !Tezos) return;
      Tezos.setWalletProvider(wallet);

      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        console.log("Active Account Found:", activeAccount.address);
        setAddress(activeAccount.address);
        fetchNFTs(activeAccount.address);
      } else {
        console.log("No active account. User needs to connect.");
      }
    };

    if (isClient) {
      setupWallet();
    }
  }, [wallet, Tezos, isClient]);

  const connectWallet = async () => {
    if (!wallet) return;
    try {
      await wallet.requestPermissions({ network: { type: "mainnet" } });
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        setAddress(activeAccount.address);
        setIsConnected(true);
        fetchNFTs(activeAccount.address);
      } else {
        console.warn("User must connect their wallet manually.");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // New disconnect function
  const disconnectWallet = () => {
    setAddress(null); // Clear the address
    setNfts([]); // Clear the NFTs
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
    
    </SectionContainer>
  );
};

export default TezosNFTCarousel;