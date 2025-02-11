import React from "react";
import SectionContainer from "./SectionContainer";
// import ImageBlock from "../ui/ImageBlock";
import Button from "../ui/CustomButton";

const SimulationSection = () => {
  return (
    <SectionContainer id="simulation" title="Simulation" background>
      <p>Learn how to run simulations efficiently.</p>
      {/* <ImageBlock src="/images/simulation.jpg" alt="Simulation" /> */}
        <Button text="Get Started" link="#simulation" />
    </SectionContainer>
  );
};

export default SimulationSection;