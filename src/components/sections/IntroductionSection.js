import React from "react";
// import { Row, Col } from "react-bootstrap";
import SectionContainer from "./SectionContainer";
import PerlinNoise from "../PerlinNoise";

const SimulationSection = () => {
  // Define surface parameters for introduction
  const surfaceParams = {
    amplitude: 15,
    scale: 0.01,
    frequency: 2,
    octaves: 2,
    usePerlin: true
  };

  return (
    <SectionContainer id="introduction" isGridLayout={false}>
       <section>
            <p>
              Discover the digital installation of „Ruido Perla NFT," where
              simulation and art converge in a globally accessible web portal.
              Explore generative landscapes and poetic texts that complement the
              NFT experience, offering an interactive dimension that invites
              active user participation.
            </p>
          </section>
      {/* Full viewport width and height container */}
      <div style={{ 
        width: '100vw', 
        height: '66vh',
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)',
        marginBottom: '0px' // Add space for controls
      }}>
        <PerlinNoise 
          showControls={false}
          enableOrbit={false}
          initialParams={surfaceParams}
        />
      </div>
    </SectionContainer>
  );
};

export default SimulationSection;