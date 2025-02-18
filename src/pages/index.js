import React from "react";
import Layout from "../components/layout";
import IntroductionSection from "../components/sections/IntroductionSection";
import InstallationSection from "../components/sections/InstallationSection";
import SimulationSection from "../components/sections/SimulationSection";
import AssetsSection from "../components/sections/AssetsSection";
import AboutSection from "../components/sections/AboutSection";
import TezosNFTCarousel from "../components/TezosNFTCarousel";


// Debug: Log Components
// console.log("InstallationSection:", InstallationSection);
// console.log("SimulationSection:", SimulationSection);
// console.log("AssetsSection:", AssetsSection);
// console.log("AboutSection:", AboutSection);


const IndexPage = () => {
  return (
    <Layout>
      <IntroductionSection />
      <InstallationSection />
      <AssetsSection />
      <SimulationSection />  
      <AboutSection />
      <TezosNFTCarousel />
    </Layout>
  );
};

export default IndexPage;