import React from "react"
import Layout from "../components/layout"
import IntroductionSection from "../components/sections/IntroductionSection"
import InstallationSection from "../components/sections/InstallationSection"
import SimulationSection from "../components/sections/SimulationSection"
// import AssetsSection from "../components/sections/AssetsSection";
import AboutSection from "../components/sections/AboutSection"
import TezosNFTCarousel from "../components/TezosNFTCarousel"
import { ContractProvider } from "../components/ContractContext" // Adjust the path as necessary
import { WalletProvider } from "../components/WalletContext"
// Debug: Log Components
// console.log("InstallationSection:", InstallationSection);
// console.log("SimulationSection:", SimulationSection);
// console.log("AssetsSection:", AssetsSection);
// console.log("AboutSection:", AboutSection);

const IndexPage = () => {
  return (
    <Layout>
      <WalletProvider>
        <ContractProvider>
          <IntroductionSection />
          <TezosNFTCarousel />
          <SimulationSection />
          <InstallationSection />
          <AboutSection />
        </ContractProvider>
      </WalletProvider>
    </Layout>
  )
}

export default IndexPage
