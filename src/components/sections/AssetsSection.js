import React from "react";
import SectionContainer from "./SectionContainer";
import CustomCard from "../ui/CustomCard";
import { Container, Row, Col } from "react-bootstrap";

const AssetsSection = () => {
  return (
    <SectionContainer id="assets" title="Assets">
      <Container>
        <Row className="justify-content-center">
          <Col md={4}>
            <CustomCard title="3D Models" description="Explore our 3D asset library." image="/images/landscape_01.png" />
          </Col>
          <Col md={4}>
            <CustomCard title="Textures" description="Download high-quality textures." image="/images/emigrate.png" />
          </Col>
        </Row>
      </Container>
    </SectionContainer>
  );
};

export default AssetsSection;