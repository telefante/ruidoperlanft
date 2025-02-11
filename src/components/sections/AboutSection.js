import React from "react";
import SectionContainer from "./SectionContainer";

const AboutSection = () => {
  return (
    <SectionContainer id="about" title="About">
      <p>This project is focused on creating innovative digital experiences.</p>
      <div style={{ height: "200px" }}></div> {/* Adds extra space below */}
    </SectionContainer>
  );
};

export default AboutSection;