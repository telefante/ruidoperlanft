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
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
  }
`

const InstallationSection = () => {
  const data = useStaticQuery(graphql`
    query {
      allFile(
        filter: {
          sourceInstanceName: { eq: "images" }
          extension: { regex: "/(jpg|jpeg|png|gif)/" }
        }
      ) {
        edges {
          node {
            relativePath
            childImageSharp {
              gatsbyImageData(
                width: 800
                height: 600
                quality: 90
                placeholder: BLURRED
                formats: [AUTO, WEBP]
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
      <Row className="align-items-center">
        <Col xs={12} md={3}>
          <h2 className="simulation-title">Installation</h2>
          <section>
            <p>
              Discover the digital installation of „Ruido Perla NFT,“ where
              simulation and art converge in a globally accessible web portal.
              Explore generative landscapes and poetic texts that complement the
              NFT experience, offering an interactive dimension that invites
              active user participation.
            </p>
          </section>
        </Col>
      </Row>
      <Row className="align-items-center justify-content-center">
        <Col xs={6} md={6}>
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
                  {/* <p>{node.name}</p> */}
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </StyledCarousel>
        </Col>
      </Row>
    </SectionContainer>
  )
}

export default InstallationSection
