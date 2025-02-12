import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { Row, Col, Carousel } from "react-bootstrap";
import SectionContainer from "./SectionContainer";
// import Button from "../ui/CustomButton";

const InstallationSection = () => {
  const data = useStaticQuery(graphql`
    query {
      allFile(
        filter: {
          sourceInstanceName: {eq: "images"}
          extension: {regex: "/(jpg|jpeg|png|gif)/"}
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
  `);
  
  console.log("Image data:", data);

  // Check if we have any images
  if (!data.allFile.edges.length) {
    return (
      <SectionContainer id="installation" title="Installation" isGridLayout={true}>
        <Row className="justify-content-center">
          <Col>
            <p>No installation images found. Please add images to the static/images/ directory.</p>
          </Col>
        </Row>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer id="installation" title="Installation" isGridLayout={true}>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Carousel 
            interval={3000} 
            controls={true} 
            indicators={true}
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
                  <p>{node.name}</p>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>
    </SectionContainer>
  );
};

export default InstallationSection;