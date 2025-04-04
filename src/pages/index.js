import React from "react"
import Layout from "../components/layout"
import IntroductionSection from "../components/sections/IntroductionSection"
import InstallationSection from "../components/sections/InstallationSection"
import SimulationSection from "../components/sections/SimulationSection"
// import AssetsSection from "../components/sections/AssetsSection";
import AboutSection from "../components/sections/AboutSection"
// import TezosNFTCarousel from "../components/TezosNFTCarousel"
import CollectionSection from "../components/sections/CollectionSection"
import { ContractProvider } from "../components/ContractContext" // Adjust the path as necessary
import { WalletProvider } from "../components/WalletContext"
import { Seo } from "../components/seo";

// Debug: Log Components
// console.log("InstallationSection:", InstallationSection);
// console.log("SimulationSection:", SimulationSection);
// console.log("AssetsSection:", AssetsSection);
// console.log("AboutSection:", AboutSection);



// export const Head = () => (
//   <Seo
//     title="Ruido Perla NFT Collection"
//     description="Explore the Ruido Perla NFT Collection - a unique digital art series blending noise and pearl aesthetics. Discover exclusive digital collectibles created by Luis Negrón van Grieekn."
//     image="/og-image.jpg" // Ensure this image exists
//     keywords="NFT collection, digital art, Ruido Perla, Luis Negrón van Grieken, blockchain art, crypto art, pearl aesthetics, noise art, digital collectibles, unique NFTs, ethereum NFT, web3 art, contemporary digital art, generative art"
//     canonicalUrl="https://ruidoperlanft.netlify.app" // Ensure this URL is correct
//   />
//   // <Seo
// ); 


const IndexPage = () => {
  return (
    <Layout>
      <WalletProvider>
        <ContractProvider>
          <IntroductionSection />
         <CollectionSection />
          <SimulationSection />
          <InstallationSection />
          <AboutSection />
        </ContractProvider>
      </WalletProvider>
    </Layout>
  )
}

export default IndexPage
