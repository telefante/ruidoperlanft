import React from "react";
import { Row, Col } from "react-bootstrap";
import SectionContainer from "./SectionContainer";
// import ImageBlock from "../ui/ImageBlock";
// import Button from "../ui/CustomButton";
import PerlinNoise from "../PerlinNoise";

const SimulationSection = () => {
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
        <PerlinNoise />
      </div>
    </SectionContainer>
  );
};

export default SimulationSection;