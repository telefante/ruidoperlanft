import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import SectionContainer from "./SectionContainer";
// import CustomCard from "../ui/CustomCard";
import { Container, Carousel, Row, Col } from "react-bootstrap";
import styled from "styled-components";

const StyledCarousel = styled(Carousel)`
  .carousel-control-prev,
  .carousel-control-next {
    width: 5%;
  }

  .carousel-indicators {
    bottom: -50px;
  }
`;

const CarouselCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 2rem;
  color: white;
  text-align: center;
  height: 100%;
  margin: 1rem;

  h3 {
    margin-bottom: 1rem;
  }

  .gatsby-image-wrapper {
    margin-bottom: 1.5rem;
    border-radius: 4px;
    overflow: hidden;
    max-height: 300px;
  }
`;

const AssetsSection = () => {
  const data = useStaticQuery(graphql`
    query {
      allFile(
        filter: {
          sourceInstanceName: { eq: "images" }
          relativeDirectory: { eq: "assets" }
        }
      ) {
        edges {
          node {
            name
            childImageSharp {
              gatsbyImageData(
                width: 400
                height: 300
                quality: 90
                placeholder: BLURRED
                formats: [AUTO, WEBP]
              )
            }
          }
        }
      }
    }
  `);

  const assets = [
    {
      title: "Textures",
      description: "",
    },
    {
      title: "Landscapes",
      description: "Generated landscapes that form the foundation of our unique digital art pieces.",
    },
    {
      title: "Animations",
      description: "Dynamic animations that showcase the fluidity of our digital creations.",
    },
  ];

  return (
    <SectionContainer id="assets">
      <Container>
        <Row className="align-items-left">
          <Col xs={12} md={3}>
            <h2>Assets</h2>
          </Col>
        </Row>
        <Row className="align-items-left">
          <Col xs={12}>
            <StyledCarousel interval={5000} indicators={true}>
              {assets.map((asset, index) => {
                const image = getImage(data.allFile.edges[index]?.node);
                return (
                  <Carousel.Item key={index}>
                    <Row className="justify-content-center">
                      <Col md={8}>
                        <CarouselCard>
                          <h3>{asset.title}</h3>
                          {image && (
                            <GatsbyImage
                              image={image}
                              alt={asset.title}
                              style={{ height: "100%", width: "100%" }}
                            />
                          )}
                          <p>{asset.description}</p>
                        </CarouselCard>
                      </Col>
                    </Row>
                  </Carousel.Item>
                );
              })}
            </StyledCarousel>
          </Col>
        </Row>
      </Container>
    </SectionContainer>
  );
};

export default AssetsSection;