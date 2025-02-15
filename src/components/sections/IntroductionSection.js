import React from "react";
import { Row, Col } from "react-bootstrap";
import SectionContainer from "./SectionContainer";
import PerlinNoise from "../PerlinNoise";

const SimulationSection = () => {
  return (
    <SectionContainer id="introduction" isGridLayout={false}>
      
      {/* Full viewport width and height container */}
      <div style={{ 
        width: '100vw', 
        height: '66vh',
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)',
        marginBottom: '0px' // Add space for controls
      }}>
        <PerlinNoise />
      </div>
    </SectionContainer>
  );
};

export default SimulationSection;