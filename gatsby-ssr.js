import React from "react"
import { WalletProvider } from "./src/components/WalletContext"
import { TrackingProvider } from "./src/contexts/TrackingContext"

export const wrapRootElement = ({ element }) => (
  <WalletProvider>
    <TrackingProvider>{element}</TrackingProvider>
  </WalletProvider>
)

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    // Basic HTML setup
    <meta key="charset" charSet="utf-8" />,
    <meta key="ua" httpEquiv="X-UA-Compatible" content="IE=edge" />,
    <meta
      key="viewport"
      name="viewport"
      content="width=device-width, initial-scale=1"
    />,

    // Title & Description
    <title key="title">Ruido Perla NFT Collection</title>,
    <meta
      name="description"
      content="Explore the Ruido Perla NFT Collection - a unique digital art series blending noise and pearl aesthetics. Discover exclusive digital collectibles created by Luis Negrón van Grieekn."
    />,
    <meta
      name="keywords"
      content="NFT collection, digital art, Ruido Perla, Luis Negrón van Grieken, blockchain art, crypto art, pearl aesthetics, noise art, digital collectibles, unique NFTs, ethereum NFT, web3 art, contemporary digital art, generative art"
    />,
    <link
      rel="canonical"
      href="https://ruidoperlanft.netlify.app"
    />,

    // Open Graph Meta Tags
    <meta
      property="og:title"
      content="Ruido Perla NFT Collection"
      key="og:title"
    />,
    <meta
      property="og:description"
      content="Explore the Ruido Perla NFT Collection - a unique digital art series blending noise and pearl aesthetics. Discover exclusive digital collectibles created by Luis Negrón van Grieekn."
      key="og:description"
    />,
    <meta
      property="og:image"
      content="https://ruidoperlanft.netlify.app/og-image.jpg"
      key="og:image"
    />,
    <meta
      property="og:url"
      content="https://ruidoperlanft.netlify.app"
      key="og:url"
    />,
    <meta property="og:type" content="website" key="og:type" />,

    // Twitter Meta Tags
    <meta
      name="twitter:card"
      content="summary_large_image"
      key="twitter:card"
    />,
    <meta
      name="twitter:title"
      content="Ruido Perla NFT Collection"
      key="twitter:title"
    />,
    <meta
      name="twitter:description"
      content="Explore the Ruido Perla NFT Collection - a unique digital art series blending noise and pearl aesthetics. Discover exclusive digital collectibles created by Luis Negrón van Grieekn."
      key="twitter:description"
    />,
    <meta
      name="twitter:image"
      content="https://ruidoperlanft.netlify.app/og-image.jpg"
      key="twitter:image"
    />,
  ])
}
