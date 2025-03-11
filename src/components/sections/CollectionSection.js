import React from "react"
import TezosNFTCarousel from "../TezosNFTCarousel"
import SectionContainer from "./SectionContainer"
import { Row, Col } from "react-bootstrap"

const CollectionSection = () => {
  return (
    <SectionContainer id="collection">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={3}>
          <h2 className="simulation-title">Collection</h2>
        </Col>
      </Row>
      <TezosNFTCarousel />
    </SectionContainer>
  )
}

export default CollectionSection