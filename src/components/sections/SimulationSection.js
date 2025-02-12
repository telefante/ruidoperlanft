import React from "react";
import { Row, Col } from "react-bootstrap";
import SectionContainer from "./SectionContainer";
// import ImageBlock from "../ui/ImageBlock";
import Button from "../ui/CustomButton";
import NoiseSurface from "../NoiseSurface";

const SimulationSection = () => {
  return (
    <SectionContainer id="simulation" title="Simulation" isGridLayout={true}>
     
     <Row className="align-items-center">
      <Col xs={12} md={3}>
          <h2 className="simulation-title">Simulation</h2>
        </Col>

      </Row>
      <Row className="align-items-left">
        <Col xs={12} md={12}>
          <NoiseSurface />
        </Col>
      </Row>

    </SectionContainer>
  );
};

export default SimulationSection;