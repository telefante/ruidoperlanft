import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { Row, Col, Carousel } from "react-bootstrap"
import styled from "styled-components"
import SectionContainer from "./SectionContainer"

// Add styled components
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

const OverlappingContainer = styled.div`  position: relative;
  width: 100%;
  margin-top: 2rem;
`

const TextOverlay = styled.div`
  position: absolute;
  top: -12rem;
  left: 0;
  background:transparent;
 
  padding: 2rem;
  z-index: 2;
  max-width: 500px;

`

const CarouselWrapper = styled.div`
  position: relative;
  z-index: 1;
`

const InstallationSection = () => {
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
                transformOptions: {
                  fit: COVER
                  cropFocus: CENTER
                }
              )
            }
            name
          }
        }
      }
    }
  `)

  console.log("Image data:", data)

  // Check if we have any images
  if (!data.allFile.edges.length) {
    return (
      <SectionContainer
        id="installation"
        title="Installation"
        isGridLayout={true}
      >
        <Row className="justify-content-center">
          <Col>
            <p>
              No installation images found. Please add images to the
              static/images/ directory.
            </p>
          </Col>
        </Row>
      </SectionContainer>
    )
  }

  return (
    <SectionContainer
      id="installation"
      title="Installation"
      isGridLayout={true}
    >
      <OverlappingContainer>
        <TextOverlay>
          <h2 className="simulation-title">Installation</h2>
          <section>
            <p>
              Discover the digital installation of „Ruido Perla NFT," where
              simulation and art converge in a globally accessible web portal.
              Explore generative landscapes and poetic texts that complement the
              NFT experience, offering an interactive dimension that invites
              active user participation.
            </p>
          </section>
        </TextOverlay>
        
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
      </OverlappingContainer>
    </SectionContainer>
  )
}

export default InstallationSection

