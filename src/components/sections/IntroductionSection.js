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
    showControls: false,
    colors: {
      solid: {
        color: 0x00ffff,    // Neon green for solid mesh
        opacity: 0.3        // Semi-transparent
      },
      wireframe: {
        color: 0x0000ff,    // Black for wireframe
        opacity: 1.0        // More visible wireframe
      }
    }
  };

  
  // Define camera initialization parameters
  // const cameraParams = {
  //         position: { x: 0.00, y: 100.00, z: 200.00 },
  //         lookAt: { x: 0.00, y: 55.28, z: 110.56 }

  // };

    // Define camera initialization parameters
    const cameraParams = {
      position: { x: -0.1332018946871437, y: 91.24420810533678, z: -1.653409036452902 },
      lookAt: { x: 0.01380516776622312, y: -8.739033492597855, z: 0.170908086977136 }
  
    };

    const queryFile = "intro.md" // Specify the file name


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
          queryFile={queryFile} // Pass the queryFile prop
        />
      </div>
    </SectionContainer>
  );
};

export default IntroductionSection;