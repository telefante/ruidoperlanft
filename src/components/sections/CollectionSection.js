import React from "react"
import TezosNFTCarousel from "../TezosNFTCarousel"
import SectionContainer from "./SectionContainer"
import { Row, Col, Button } from "react-bootstrap"
import styled from "styled-components"

const DescriptionText = styled.p`
  max-width: 50vw;
  text-align: justify;
  font-size: 1.6rem;
  @media (max-width: 768px) {
    max-width: 90vw;
  }
`

const CollectionSection = () => {
  const DROP = false // Define DROP here or get it from props/context
  const dropDate = "April 2, 2025" // Replace with your actual drop date
  const COLLECTION_CONTRACT = process.env.GATSBY_TEZOS_CONTRACT

  return (
    <SectionContainer id="collection">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={3}>
          <h2 className="simulation-title">Collection</h2>
        </Col>
      </Row>

      {DROP ? (
        <TezosNFTCarousel />
      ) : (
        <div>
          <h1>Coming soon -- Drop on {dropDate}</h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DescriptionText>
              <Row className="align-items-center mb-4">
                👉 Ruido Perla is more than a collection—it is an evolving
                digital extension of an installation. These generative NFTs are
                not just static images but keys unlocking access to a ongoing
                process.
              </Row>
              🟢
              <strong>Legendary (1/1)</strong> → Singular moments of entropy -
              it gives you some secret powers
              <br /> 🔵
              <strong>Rare (very Limited Editions)</strong> → Echoes of
              complexity, held in scarce iterations.
              <br /> ⚪
              <strong>Common (Small Batch)</strong> → A fleeting glimpse into
              the infinite, yet still finite. Holding one grants you private
              access to an exclusive generative simulation, where landscapes
              reshape and dissolve in real time. Limited Supply. No Second
              Chances. 👉
              <Row>
                <Button
                  m-4
                  href={`${process.env.GATSBY_OBJKT_COLLECTION_URL}/${COLLECTION_CONTRACT}`}
                  target="_blank"
                  variant="secondary"
                  style={{
                    marginTop: "1rem",
                    fontFamily: "var(--primary-font)",
                    maxWidth: "200px",
                    marginLeft: "20px",
                  }}
                >
                  soon in this Collection on Objkt
                </Button>
              </Row>
            </DescriptionText>
          </div>
        </div>
      )}
    </SectionContainer>
  )
}

export default CollectionSection