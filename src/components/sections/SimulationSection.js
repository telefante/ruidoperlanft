import React from "react";
import { Row, Col } from "react-bootstrap";
import SectionContainer from "./SectionContainer";

import PerlinNoise from "../PerlinNoise";

const SimulationSection = () => {
  // Define surface parameters for simulation
  const surfaceParams = {
    amplitude: 20,      // Larger amplitude for more dramatic waves
    scale: 0.015,       // Slightly larger scale for more visible patterns
    frequency: 1.5,     // Moderate frequency for smooth animation
    octaves: 3,         // More octaves for complex detail
    usePerlin: true     // Using Perlin noise for smoother transitions
  };

  // Define camera initialization parameters
  const cameraParams = {
    position: { x: -0.00, y: 190.13, z: 0.00 },
    lookAt: { x: -0.00, y: 90.13, z: 0.00 }
  };

  return (
    <SectionContainer id="simulation" isGridLayout={false}>
      <Row className="align-items-center mb-4">
        <Col xs={12} md={3}>
          <h2 className="simulation-title">Simulation</h2>
        </Col>
      </Row>
      
      {/* Full viewport width and height container */}
      <div style={{ 
        width: '100vw', 
        height: '66vh',
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)',
        marginBottom: '0px' // Add space for controls
      }}>
        <PerlinNoise 
          showControls={true}
          enableOrbit={true}
          initialParams={surfaceParams}
          cameraParams={cameraParams}
        />
      </div>
    </SectionContainer>
  );
};

export default SimulationSection;