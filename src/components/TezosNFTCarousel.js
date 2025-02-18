import React, { useState, useEffect } from "react";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconEvent } from "@airgap/beacon-dapp"; // <-- Import this
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Container, Button } from "react-bootstrap";
import SectionContainer from "./sections/SectionContainer"; // <-- Import SectionContainer
import placeholderImage from '../assets/placeholder.jpg'; // <-- Import the placeholder image


const TezosNFTCarousel = () => {
  const [wallet, setWallet] = useState(null);
  const [Tezos, setTezos] = useState(new TezosToolkit("https://mainnet.api.tez.ie"));
  const [address, setAddress] = useState(null);
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const setupWallet = async () => {
      const wallet = new BeaconWallet({ name: "Tezos NFT Viewer" });
      Tezos.setWalletProvider(wallet);
      setWallet(wallet);
  
      // 1. Check if an active account already exists
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        console.log("Active Account Found:", activeAccount.address);
        setAddress(activeAccount.address);
        fetchNFTs(activeAccount.address);
      } else {
        console.log("No active account. User needs to connect.");
      }
  
      // 2. Subscribe to wallet connection events (fixes missing subscription issue)
      wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (account) => {
        console.log("Active Account Set:", account.address);
        setAddress(account.address);
        fetchNFTs(account.address);
      });
    };
  
    setupWallet();
  }, [Tezos]);

  const connectWallet = async () => {
    if (!wallet) return;
  
    try {
      await wallet.requestPermissions({ network: { type: "mainnet" } });
  
      // Ensure an active account is set
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        setAddress(activeAccount.address);
        fetchNFTs(activeAccount.address);
      } else {
        console.warn("User must connect their wallet manually.");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };


// List all NFTs from a Wallet 

  // const fetchNFTs = async (walletAddress) => {
  //   try {
  //     const response = await fetch(`https://api.tzkt.io/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`);
  //     const data = await response.json();
  //     const filteredNFTs = data.filter((token) => token.token.metadata?.artifactUri);
  //     setNfts(filteredNFTs);
  //   } catch (error) {
  //     console.error("Error fetching NFTs: ", error);
  //   }
  // };

  const COLLECTION_CONTRACT = "KT1VsqcpRfzzPCqPiwLXsFKh6BCpEfsJt2yR"; // Replace with your collection's address

  const fetchNFTs = async (walletAddress) => {
    try {
      const response = await fetch(`https://api.tzkt.io/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`);
      const data = await response.json();
  
      // Filter NFTs from a specific contract (collection)
      const filteredNFTs = data.filter((nft) => nft.token.contract.address === COLLECTION_CONTRACT);
  
      // Ensure they have images
      const nftsWithImages = filteredNFTs.filter((nft) => nft.token.metadata?.artifactUri);
      
      setNfts(nftsWithImages);
    } catch (error) {
      console.error("Error fetching NFTs: ", error);
    }
  };

  return (
    <SectionContainer id="tezos-nft-carousel" title="Your NFTs" background={true} isGridLayout={false}>
      <Container className="flex flex-col items-center p-4">
        {!address ? (
          <Button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
            onClick={connectWallet}
          >
            Tezos Wallet
          </Button>
        ) : (
          <>
            <h2 className="text-xl font-bold mt-4">Your NFTs</h2>
            <Swiper
              modules={[Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              pagination={{ clickable: true }}
              className="w-full max-w-lg mt-4"
            >
              {nfts.length > 0 ? (
                nfts.map((nft, index) => {
                  // const imageUrl = nft.token.metadata.artifactUri.replace("ipfs://", "https://dweb.link/ipfs/");
                  // console.log("Image URL:", imageUrl); // Log the image URL for debugging
                  const thumbnailUrl = nft.token.metadata.thumbnailUri.replace("ipfs://", "https://dweb.link/ipfs/");
                  console.log("Name:", nft.token.metadata.name);
                  console.log("Thumbnail URL:", thumbnailUrl);
              
                  // console.log("NFT Image URL:", getIPFSUrl(nft.token.metadata.artifactUri));
                  return (
                    <SwiperSlide key={index}>
                      <div className="p-4 bg-white shadow-lg rounded-lg">
                        <img
                          src={thumbnailUrl}
                          alt={nft.token.metadata.name}
                          className="w-full h-64 object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null; // Prevent looping
                            e.target.src = placeholderImage; // Use the imported placeholder image
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
