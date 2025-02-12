
import React from "react";
import SectionContainer from "./SectionContainer";
// import Button from "../ui/CustomButton";
import { Row, Col, Carousel } from "react-bootstrap";

const HowSection = () => {
  return (
    <SectionContainer id="installation" >
       <Row className="align-items-center">
      <Col xs={12} md={3}>
          <h2 className="simulation-title">Installation</h2>
        </Col>
      </Row>
      <Row className="align-items-left">
        <Col xs={12} md={12}>
        {/* <Button text="Get Started" link="#simulation" /> */}
        <Carousel interval={3000} controls={false} indicators={true}>
          <Carousel.Item>
            <div className="d-flex align-items-center justify-content-center" style={{height: "400px"}}>
              <h3>Step 1</h3>
              <p>Download and install the Metamask wallet extension</p>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div className="d-flex align-items-center justify-content-center" style={{height: "400px"}}>
              <h3>Step 2</h3>
              <p>Connect your wallet to the Ethereum network</p>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div className="d-flex align-items-center justify-content-center" style={{height: "400px"}}>
              <h3>Step 3</h3>
              <p>Mint your unique Ruido Perla NFT</p>
            </div>
          </Carousel.Item>
        </Carousel>
        </Col>
      </Row>
    </SectionContainer>
  );
};

export default HowSection;