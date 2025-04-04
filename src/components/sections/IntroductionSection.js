import React, { useState } from "react";
import SectionContainer from "./SectionContainer";
import PerlinNoise from "../PerlinNoise";

const IntroductionSection = () => {
  const [controlsVisible, setControlsVisible] = useState(false); // Define the state
  const verificationEnabled = true; // Define verificationEnabled state or constant

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
        color: 0x00ffff,
        opacity: 0.3
      },
      wireframe: {
        color: 0x0000ff,
        opacity: 1.0
      }
    }
  };

  const cameraParams = {
    position: { x: -0.1332018946871437, y: 91.24420810533678, z: -1.653409036452902 },
    lookAt: { x: 0.01380516776622312, y: -8.739033492597855, z: 0.170908086977136 }
  };

  const queryFile = "intro.md";

  return (
    <SectionContainer id="introduction" isGridLayout={false}>
      <div style={{ 
        width: '100vw', 
        height: '66vh',
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)',
        marginBottom: '0px'
      }}>
        <PerlinNoise 
          enableOrbit={true}
          initialParams={surfaceParams}
          cameraParams={cameraParams}
          showCaptureButton={false}
          queryFile={queryFile}
          controlsVisible={controlsVisible} // Pass the state
          setControlsVisible={setControlsVisible} // Pass the setter function
          verificationEnabled={verificationEnabled} // Pass verificationEnabled
        />
      </div>
    </SectionContainer>
  );
};

export default IntroductionSection;