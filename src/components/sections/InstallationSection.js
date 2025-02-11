import React from "react";
import SectionContainer from "./SectionContainer";
import Button from "../ui/Button";

const InstallationSection = () => {
  return (
    <SectionContainer id="installation" title="Installation">
      <p>Installation </p>
      <Button text="Get Started" link="#simulation" />
    </SectionContainer>
  );
};

export default InstallationSection;