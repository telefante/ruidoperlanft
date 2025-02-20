import React, { useState, useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/pagination"
import { Pagination } from "swiper/modules"
import SectionContainer from "./sections/SectionContainer"
import placeholderImage from "../assets/placeholder.jpg"
import { useStaticQuery, graphql } from "gatsby"
import { DAppClient, BeaconEvent } from "@airgap/beacon-sdk"
import './styles/Tezos.css';

// ✅ Lazy-load React Bootstrap components to prevent SSR issues
let Container, Button
if (typeof window !== "undefined") {
  Container = require("react-bootstrap/Container").default
  Button = require("react-bootstrap/Button").default
}

const TezosNFTCarousel = () => {
  const [isClient, setIsClient] = useState(false)
  const [address, setAddress] = useState(null)
  const [nfts, setNfts] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  // ✅ Use useRef to store DAppClient (to avoid multiple instances)
  const dAppClientRef = useRef(null)

  // Fetch contract number from site metadata
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          contractNumber
        }
      }
    }
  `)
  const COLLECTION_CONTRACT = data.site.siteMetadata.contractNumber

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const style = document.createElement("style")
      style.innerHTML = `
#alert-wrapper-show {
  display: grid;
  align-items: center;
  justify-content: center;
  position: fixed;
  height: 100%;
  width: 100vw;
  overflow: hidden;
  top: 0px;
  left: 0px;
  background-color: rgba(0, 255, 106, 0.6);
  opacity: 1;
  transition: all ease 0.3s;
  z-index: 99999;
}

.alert-wrapper-hide {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  height: 100%;
  width: 100vw;
  overflow: hidden;
  top: 0px;
  left: 0px;
  background-color: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: all ease 0.3s;
  z-index: 99999;
}

.theme__dark .alert-modal-show {
  background-color: #27334c;
}

.theme__dark .alert-modal-hide {
  background-color: #27334c;
}

.theme__dark .alert-footer {
  color: white;
  -webkit-box-shadow: 0px -4px 12px rgb(0 0 0 / 20%);
  -moz-box-shadow: 0px -4px 12px rgb(0 0 0 / 20%);
  box-shadow: 0px -4px 12px rgb(0 0 0 / 20%);
}

.theme__dark .alert-logo svg g {
  fill: white;
}

.alert-modal-show {
  background-color: red;
  border-radius: 32px;
  transition: all ease 0.3s;
  transform: translateY(0px);
  opacity: 1;
  width: 480px;
}

.alert-modal-hide {
  background-color: white;
  border-radius: 32px;
  transition: all ease 0.3s;
  transform: translateY(24px);
  opacity: 1;
  width: 480px;
}

.alert-modal-loading-wrapper {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.alert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.8em;
  padding-top: 1.2em;
  padding-bottom: 0px;
}

.alert-button-icon-empty {
  width: 24px;
  height: 24px;
  padding: 2px;
}

.alert-button-icon {
  width: 24px;
  height: 24px;
  padding: 2px;
  border-radius: 100%;
  border: 1px solid #f0f0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  fill: #64748b;
  transition: all ease 0.2s;
}

.alert-button-icon:hover {
  background-color: #475569;
  border: 1px solid #475569;
  fill: #e2e8f0;
}

.alert-logo {
  margin: 0px 6em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-logo svg {
  height: 28px;
}

.alert-body {
  padding: 1.8em;
  padding-bottom: 0px;
  transition: all ease 0.3s;
}

.alert-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  color: grey;
  cursor: pointer;
  -webkit-box-shadow: 0px -4px 12px rgb(50 50 50 / 6%);
  -moz-box-shadow: 0px -4px 12px rgb(50 50 50 / 6%);
  box-shadow: 0px -4px 12px rgb(50 50 50 / 6%);
  font-size: 0.938rem;
  font-weight: bold;
  height: 64px;
}

.alert-body-extra-show {
  transition: all ease 0.3s;
  overflow: hidden;
  max-height: 35vh;
  overflow-y: auto;
}

.alert-body-extra-hide {
  transition: all ease 0.3s;
  overflow: hidden;
  max-height: 0px;
}

.alert-divider {
  border-top: 1px solid #aaaaaa42;
  width: 100%;
  border-radius: 6px;
}

@media only screen and (max-width: 800px) {
  .alert-logo {
    margin: 0px 2em;
  }

  .alert-wrapper-show {
    align-items: flex-end;
    width: 100%;
  }

  .alert-wrapper-hide {
    align-items: flex-end;
    width: 100%;
  }

  #alert-modal-show {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    padding-bottom: 1.8em;
    width: 100%;
  }

  .alert-modal-hide {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    padding-bottom: 1.8em;
  }
}

@media only screen and (max-width: 300px) {
  .alert-wrapper-show {
    align-items: flex-end;
    width: 100vw;
  }

  .alert-wrapper-hide {
    align-items: flex-end;
    width: 100vw;
  }

  .alert-body {
    padding: 0.8em;
  }

  .alert-body {
    padding: 0.8em;
    padding-top: 0.4em;
  }

  .alert-logo {
    margin: 0px;
    transform: scale(0.8);
  }
}
      
      `
      document.head.appendChild(style)
    }
  }, [])

  useEffect(() => {
    if (!isClient) return

    // ✅ Ensure DAppClient is initialized only once
    if (!dAppClientRef.current) {
      dAppClientRef.current = new DAppClient({
        name: "Ruido Perla NFT Collection",
      })

      // ✅ Subscribe to active account events (Fixes missing subscription warning)
      dAppClientRef.current.subscribeToEvent(
        BeaconEvent.ACTIVE_ACCOUNT_SET,
        async account => {
          console.log("Beacon Account Set:", account.address)
          setAddress(account.address)
          setIsConnected(true)
          fetchNFTs(account.address)
        }
      )
    }

    const setupWallet = async () => {
      const activeAccount = await dAppClientRef.current.getActiveAccount()
      if (activeAccount) {
        console.log("Already connected:", activeAccount.address)
        setAddress(activeAccount.address)
        setIsConnected(true)
        fetchNFTs(activeAccount.address)
      } else {
        console.log("No active account. User needs to connect.")
      }
    }

    setupWallet()
  }, [isClient])

  const connectWallet = async () => {
    try {
      // ✅ Inject CSS dynamically on button click
      if (typeof window !== "undefined") {
        const existingStyle = document.getElementById("beacon-custom-style")
        if (!existingStyle) {
          const style = document.createElement("style")
          
          style.innerHTML = `
    .alert-wrapper-show {
      display: grid;
      align-items: center;
      justify-content: center;
      position: fixed;
      height: 100%;
      width: 100vw;
      overflow: hidden;
      top: 0px;
      left: 0px;
      background-color: rgba(0, 0, 0, 0.6);
      opacity: 1;
      transition: all ease 0.3s;
      z-index: 99999;
    }
    
    .alert-wrapper-hide {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      height: 100%;
      width: 100vw;
      overflow: hidden;
      top: 0px;
      left: 0px;
      background-color: rgba(0, 0, 0, 0.6);
      opacity: 0;
      transition: all ease 0.3s;
      z-index: 99999;
    }
    
    .theme__dark .alert-modal-show {
      background-color: #27334c;
    }
    
    .theme__dark .alert-modal-hide {
      background-color: #27334c;
    }
    
    .theme__dark .alert-footer {
      color: white;
      -webkit-box-shadow: 0px -4px 12px rgb(0 0 0 / 20%);
      -moz-box-shadow: 0px -4px 12px rgb(0 0 0 / 20%);
      box-shadow: 0px -4px 12px rgb(0 0 0 / 20%);
    }
    
    .theme__dark .alert-logo svg g {
      fill: white;
    }
    
    .alert-modal-show {
      background-color: red;
      border-radius: 32px;
      transition: all ease 0.3s;
      transform: translateY(0px);
      opacity: 1;
      width: 480px;
    }
    
    .alert-modal-hide {
      background-color: white;
      border-radius: 32px;
      transition: all ease 0.3s;
      transform: translateY(24px);
      opacity: 1;
      width: 480px;
    }
    
    .alert-modal-loading-wrapper {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .alert-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.8em;
      padding-top: 1.2em;
      padding-bottom: 0px;
    }
    
    .alert-button-icon-empty {
      width: 24px;
      height: 24px;
      padding: 2px;
    }
    
    .alert-button-icon {
      width: 24px;
      height: 24px;
      padding: 2px;
      border-radius: 100%;
      border: 1px solid #f0f0f1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      fill: #64748b;
      transition: all ease 0.2s;
    }
    
    .alert-button-icon:hover {
      background-color: #475569;
      border: 1px solid #475569;
      fill: #e2e8f0;
    }
    
    .alert-logo {
      margin: 0px 6em;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .alert-logo svg {
      height: 28px;
    }
    
    .alert-body {
      padding: 1.8em;
      padding-bottom: 0px;
      transition: all ease 0.3s;
    }
    
    .alert-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      color: grey;
      cursor: pointer;
      -webkit-box-shadow: 0px -4px 12px rgb(50 50 50 / 6%);
      -moz-box-shadow: 0px -4px 12px rgb(50 50 50 / 6%);
      box-shadow: 0px -4px 12px rgb(50 50 50 / 6%);
      font-size: 0.938rem;
      font-weight: bold;
      height: 64px;
    }
    
    .alert-body-extra-show {
      transition: all ease 0.3s;
      overflow: hidden;
      max-height: 35vh;
      overflow-y: auto;
    }
    
    .alert-body-extra-hide {
      transition: all ease 0.3s;
      overflow: hidden;
      max-height: 0px;
    }
    
    .alert-divider {
      border-top: 1px solid #aaaaaa42;
      width: 100%;
      border-radius: 6px;
    }
    
    @media only screen and (max-width: 800px) {
      .alert-logo {
        margin: 0px 2em;
      }
    
      .alert-wrapper-show {
        align-items: flex-end;
        width: 100%;
        background-color: red;
      }
    
      .alert-wrapper-hide {
        align-items: flex-end;
        width: 100%;
      }
    
      #alert-modal-show {
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        padding-bottom: 1.8em;
        width: 80%;
        background-color: red;
      }
    
      .alert-modal-hide {
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        padding-bottom: 1.8em;
      }
    }
    
    @media only screen and (max-width: 300px) {
      .alert-wrapper-show {
        align-items: flex-end;
        width: 100vw;
      }
    
      .alert-wrapper-hide {
        align-items: flex-end;
        width: 100vw;
      }
    
      .alert-body {
        padding: 0.8em;
      }
    
      .alert-body {
        padding: 0.8em;
        padding-top: 0.4em;
      }
    
      .alert-logo {
        margin: 0px;
        transform: scale(0.8);
      }
    }
          `
          document.head.appendChild(style)
        }
      }

      // ✅ Request wallet permissions
      const permissions = await dAppClientRef.current.requestPermissions()
      console.log("New connection:", permissions.address)
      setAddress(permissions.address)
      setIsConnected(true)
      fetchNFTs(permissions.address)
    } catch (error) {
      console.error("Wallet connection failed:", error)
      alert(
        "An error occurred while connecting to the wallet. Please try again."
      )
    }
  }
  const disconnectWallet = async () => {
    setAddress(null)
    setNfts([])
    setIsConnected(false)
    console.log("Wallet disconnected")
  }

  const fetchNFTs = async walletAddress => {
    try {
      const response = await fetch(
        `https://api.tzkt.io/v1/tokens/balances?account=${walletAddress}&token.standard=fa2`
      )
      const data = await response.json()
      const filteredNFTs = data.filter(
        nft => nft.token.contract.address === COLLECTION_CONTRACT
      )
      const nftsWithImages = filteredNFTs.filter(
        nft => nft.token.metadata?.artifactUri
      )
      setNfts(nftsWithImages)
    } catch (error) {
      console.error("Error fetching NFTs: ", error)
    }
  }

  if (!isClient) {
    return <p>Loading...</p>
  }

  return (
    <SectionContainer
      id="tezos-nft-carousel"
      title="Connect to your Ruido Perla NFTs"
      background={false}
      isGridLayout={true}
    >
      <Container className="flex flex-col items-center p-4">
        {!address ? (
          <>
            <h2>Connect to your Ruido Perla NFTs</h2>
            <Button
              style={{
                fontFamily: "var(--primary-font)",
                fontStyle: "italic",
                fontSize: "1.6rem",
                fontWeight: "bold",
                backgroundColor: isConnected ? "green" : "blue",
                color: "white",
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
              style={{
                fontFamily: "var(--primary-font)",
                fontStyle: "italic",
                fontSize: "1.2rem",
              }}
              variant="danger"
              onClick={disconnectWallet}
              className="mt-4"
            >
              Disconnect Wallet
            </Button>
            <Swiper
              modules={[Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              pagination={{ clickable: true }}
              className="w-full max-w-lg mt-4"
            >
              {nfts.length > 0 ? (
                nfts.map((nft, index) => {
                  const thumbnailUrl = nft.token.metadata.thumbnailUri.replace(
                    "ipfs://",
                    "https://dweb.link/ipfs/"
                  )
                  return (
                    <SwiperSlide key={index}>
                      <div className="p-4 shadow-lg rounded-lg">
                        <img
                          src={thumbnailUrl}
                          alt={nft.token.metadata.name}
                          className="w-full h-64 object-cover rounded-md"
                          onError={e => {
                            e.target.onerror = null
                            e.target.src = placeholderImage
                          }}
                        />
                        <h3 className="text-center mt-2 text-lg font-semibold">
                          {nft.token.metadata.name || "Unnamed NFT"}
                        </h3>
                      </div>
                    </SwiperSlide>
                  )
                })
              ) : (
                <p className="text-center text-gray-500">No NFTs found</p>
              )}
            </Swiper>
          </>
        )}
      </Container>
    </SectionContainer>
  )
}

export default TezosNFTCarousel
