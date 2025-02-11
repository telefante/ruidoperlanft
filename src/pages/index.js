import React from "react";
import Layout from "../components/Layout";
import InstallationSection from "../components/sections/InstallationSection";
import SimulationSection from "../components/sections/SimulationSection";
import AssetsSection from "../components/sections/AssetsSection";
import AboutSection from "../components/sections/AboutSection";

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