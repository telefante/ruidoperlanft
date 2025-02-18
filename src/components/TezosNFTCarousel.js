import React, { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

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
    };
    setupWallet();
  }, [Tezos]);

  const connectWallet = async () => {
    if (!wallet) return;
    await wallet.requestPermissions();
    const userAddress = await wallet.getPKH();
    setAddress(userAddress);
    fetchNFTs(userAddress);
  };

  const fetchNFTs = async (walletAddress) => {
    try {
      const response = await fetch(`https://api.tzkt.io/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`);
      const data = await response.json();
      const filteredNFTs = data.filter((token) => token.token.metadata?.artifactUri);
      setNfts(filteredNFTs);
    } catch (error) {
      console.error("Error fetching NFTs: ", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {!address ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
          onClick={connectWallet}
        >
          Connect Tezos Wallet
        </button>
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
              nfts.map((nft, index) => (
                <SwiperSlide key={index}>
                  <div className="p-4 bg-white shadow-lg rounded-lg">
                    <img
                      src={nft.token.metadata.artifactUri.replace("ipfs://", "https://ipfs.io/ipfs/")}
                      alt={nft.token.metadata.name}
                      className="w-full h-64 object-cover rounded-md"
                    />
                    <h3 className="text-center mt-2 text-lg font-semibold">{nft.token.metadata.name || "Unnamed NFT"}</h3>
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <p className="text-center text-gray-500">No NFTs found</p>
            )}
          </Swiper>
        </>
      )}
    </div>
  );
};

export default TezosNFTCarousel;
