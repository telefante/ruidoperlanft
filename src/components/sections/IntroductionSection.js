import React from "react";
// import { Row, Col } from "react-bootstrap";
import SectionContainer from "./SectionContainer";
import PerlinNoise from "../PerlinNoise";

const IntroductionSection = () => {
  // Define surface parameters for introduction
  const surfaceParams = {
    amplitude: 15,
    scale: 0.01,
    frequency: 2,
    octaves: 2,
    usePerlin: true,
    showControls: false
  };

  
  // Define camera initialization parameters
  // const cameraParams = {
  //         position: { x: 0.00, y: 100.00, z: 200.00 },
  //         lookAt: { x: 0.00, y: 55.28, z: 110.56 }

  // };

    // Define camera initialization parameters
    const cameraParams = {
      position: { x: -0.00, y: 190.13, z: 0.00 },
      lookAt: { x: -0.00, y: 90.13, z: 0.00 }
    };

  return (
    <SectionContainer id="introduction" isGridLayout={false}>
       {/* <section>
            <p>
              Discover the digital installation of „Ruido Perla NFT," where
              simulation and art converge in a globally accessible web portal.
              Explore generative landscapes and poetic texts that complement the
              NFT experience, offering an interactive dimension that invites
              active user participation.
            </p>
          </section> */}
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
          enableOrbit={true}
          initialParams={surfaceParams}
          cameraParams={cameraParams}
          showCaptureButton={false}
        />
      </div>
    </SectionContainer>
  );
};

export default IntroductionSection;