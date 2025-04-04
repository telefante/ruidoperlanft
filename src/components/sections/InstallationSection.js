import React, { useState } from "react"
import { useStaticQuery, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { Row, Col, Carousel, Modal, Button } from "react-bootstrap"
import styled from "styled-components"
import SectionContainer from "./SectionContainer"
import { useTracking } from "../../contexts/TrackingContext"

// Add styled components

const DescriptionText = styled.p`
  max-width: 30vw;
  text-align: justify;
  font-size: 1.2rem;
  @media (max-width: 768px) {
    max-width: 100vw;
  }
`

const StyledCarousel = styled(Carousel)`
  .carousel-inner {
    background: transparent;
  }

  .carousel-control-prev,
  .carousel-control-next {
    background: transparent;
  }

  .carousel-indicators {
    background: transparent;
  }

  .carousel-caption {
    background: transparent;
  }

  .carousel-image-container {
    height: 450px;
    width: 450px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    margin: 0 auto;
  }

  .gatsby-image-wrapper {
    border: 10px solid rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    width: 450px !important;
    height: 450px !important;
    img {
      object-fit: cover !important;
    }
  }
`

// const OverlappingContainer = styled.div`
//   position: relative;
//   width: 100%;
//   margin-top: 2rem;
// `

// const TextOverlay = styled.div`
//   position: absolute;
//   top: -12rem;
//   left: 0;
//   background: transparent;

//   padding: 2rem;
//   z-index: 2;
//   max-width: 500px;
// `

const CarouselWrapper = styled.div`
  position: relative;
  z-index: 1;
`

const InstallationSection = () => {
  const [showModal, setShowModal] = useState(false)
  const { trackEvent } = useTracking()

  // const handleCollectNowClick = url => {
  //   // console.log("Clicked on Collection: ", url)
  //   trackEvent(`clicked on Collection in section Whitepaper`)
  // }

  const data = useStaticQuery(graphql`
    query {
      allFile(
        filter: {
          sourceInstanceName: { eq: "images" }
          relativeDirectory: { eq: "installation" }
          extension: { regex: "/(jpg|jpeg|png|gif)/" }
        }
      ) {
        edges {
          node {
            relativePath
            childImageSharp {
              gatsbyImageData(
                width: 450
                height: 450
                quality: 90
                placeholder: BLURRED
                formats: [AUTO, WEBP]
                transformOptions: { fit: COVER, cropFocus: CENTER }
              )
            }
            name
          }
        }
      }
    }
  `)

  // console.log("Image data:", data)

  // const COLLECTION_CONTRACT = process.env.GATSBY_RUIDOPERLANFT_CONTRACT
  // const OBJKT_TOKEN_URL = process.env.GATSBY_OBJKT_TOKEN_URL

  return (
    <SectionContainer
      id="installation"
      title="Installation"
      isGridLayout={true}
    >
      {/* <OverlappingContainer> */}
      {/* <TextOverlay> */}
      <Row className="align-items-center mb-4">
        <Col xs={12} md={6}>
          <h2 className="simulation-title">whitepaper</h2>
        </Col>
      </Row>
      {/* <section
            style={{
              textAlign: "justify",
              lineHeight: "1.1",
              letterSpacing: "0.02em",
              hyphens: "auto",
            }}
          >
            <p>Ruido Perla explores the poetics of the unpredictable ....</p> */}

      {/* </section> */}

      <Row className="align-items-center mb-4">
        <DescriptionText>
          <p>
            👉 These NFTs are more than digital artifacts; they are fragments of
            an ever-changing landscape. Each one is a unique translation of the
            installation’s essence, existing only once in its current form
            before the next permutation takes shape. Collectors don’t just own
            an artwork—they gain access to a continuous, evolving digital
            simulation, available only to holders.
          </p>
        </DescriptionText>
      </Row>
      <Row>
        <Row className="align-items-center mb-2">
          <Button
            variant="danger"
            style={{ fontFamily: "var(--primary-font)", maxWidth: "200px" }}
            className="mt-3"
            // onClick={() => setShowModal(true)}
            href="/Whitepaper.pdf"
            target="_blank"
            onClick={trackEvent(`clicked on Whitepaper in section Whitepaper`)}
          >
            read whitepaper
          </Button>
        </Row>
       
      </Row>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "var(--primary-font)" }}>
            whitepaper coming soon ..
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: "black" }}>
            Its name comes from the Perlin noise algorithm, a system that
            generates chaotic landscapes inspired by nature, and from the pearl,
            a rare and accidental discovery. From the tangible to the
            generative, from the physical to the ephemeral—Ruido Perla blurs the
            boundaries between installation art and digital evolution.
          </p>
        </Modal.Body>
      </Modal>
      {/* </TextOverlay> */}

      <CarouselWrapper>
        <StyledCarousel
          interval={1500}
          controls={true}
          indicators={false}
          ride="carousel"
          pause="hover"
          className="installation-carousel"
        >
          {data.allFile.edges.map(({ node }, index) => (
            <Carousel.Item key={node.name}>
              <div className="carousel-image-container">
                <GatsbyImage
                  image={getImage(node)}
                  alt={`Installation photo ${node.name}`}
                  className="carousel-image"
                />
              </div>
              <Carousel.Caption>
                <h3>Installation {index + 1}</h3>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </StyledCarousel>
      </CarouselWrapper>
      {/* </OverlappingContainer> */}
    </SectionContainer>
  )
}

export default InstallationSection
