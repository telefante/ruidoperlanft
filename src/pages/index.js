import React from "react";
import Layout from "../components/layout";
import InstallationSection from "../components/sections/InstallationSection";
import SimulationSection from "../components/sections/SimulationSection";
import AssetsSection from "../components/sections/AssetsSection";
import AboutSection from "../components/sections/AboutSection";


// Debug: Log Components
console.log("InstallationSection:", InstallationSection);
console.log("SimulationSection:", SimulationSection);
console.log("AssetsSection:", AssetsSection);
console.log("AboutSection:", AboutSection);


const IndexPage = () => {
  return (
    <Layout>
      <InstallationSection />
      <SimulationSection />
      <AssetsSection />
      <AboutSection />
    </Layout>
  );
};

export default IndexPage;