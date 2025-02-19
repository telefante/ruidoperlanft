import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import SectionContainer from "./sections/SectionContainer";
import placeholderImage from '../assets/placeholder.jpg';

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
        fetchNFTs(activeAccount.address);
      } else {
        console.warn("User must connect their wallet manually.");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const COLLECTION_CONTRACT = "KT1VsqcpRfzzPCqPiwLXsFKh6BCpEfsJt2yR";

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
    <SectionContainer id="tezos-nft-carousel" title="Your NFTs" background={true} isGridLayout={false}>
      <Container className="flex flex-col items-center p-4">
        {!address ? (
          <Button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700" onClick={connectWallet}>
            Tezos Wallet
          </Button>
        ) : (
          <>
            <h2 className="text-xl font-bold mt-4">Your NFTs</h2>
            <Swiper modules={[Pagination]} spaceBetween={10} slidesPerView={1} pagination={{ clickable: true }} className="w-full max-w-lg mt-4">
              {nfts.length > 0 ? (
                nfts.map((nft, index) => {
                  const thumbnailUrl = nft.token.metadata.thumbnailUri.replace("ipfs://", "https://dweb.link/ipfs/");
                  return (
                    <SwiperSlide key={index}>
                      <div className="p-4 bg-white shadow-lg rounded-lg">
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