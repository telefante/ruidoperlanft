import React, { useState } from "react"
import { Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import styled from "styled-components"
import SectionContainer from "./SectionContainer"
import { Button, Carousel } from "react-bootstrap"

const OverlappingContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 2rem;
`

const TextOverlay = styled.div`
  position: absolute;
  top: -12rem;
  left: 0;
  background: transparent;
  padding: 2rem;
  z-index: 2;
  max-width: 500px;
`

const ImageWrapper = styled.div`
  position: relative;
  z-index: 1;

  .about-image-container {
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
  }
`

const StyledButton = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`

const AboutSection = () => {
  const [showCarousel, setShowCarousel] = useState(true);

  const toggleCarousel = () => {
    setShowCarousel(prev => !prev);
  };

  const data = useStaticQuery(graphql`
    query {
      allFile(
        filter: { sourceInstanceName: { eq: "images" }, relativeDirectory: { eq: "about" } }
      ) {
        nodes {
          childImageSharp {
            gatsbyImageData(
              width: 800
              height: 600
              quality: 90
              placeholder: BLURRED
              formats: [AUTO, WEBP]
            )
          }
        }
      }
    }
  `)

  const images = data.allFile.nodes.map(node => getImage(node.childImageSharp))

  return (
    <SectionContainer id="about" >
      <OverlappingContainer>
        <TextOverlay>
        <h2 className="simulation-title">community</h2>
          <section>
            <p>
              Gain behind-the-scenes insight into the creative process of „Ruido
              Perla NFT.“ Discover the inspiration, challenges, and integration
              of simulation, art, and net-based interaction that bring this
              unique NFT collection to life. Learn how poetry and generative
              landscapes intertwine to explore the relationship between noise
              and the pearl.
            </p>
           {/* <Button variant="primary" onClick={toggleCarousel} style={{ marginBottom: '20px' }}>
              {showCarousel ? 'Hide Carousel' : 'Show Carousel'}
            </Button> */}
            {/* {showCarousel && (
              <Carousel>
                {images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <GatsbyImage
                      image={image}
                      alt={`About section image ${index + 1}`}
                      className="about-image"
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            )} */}
          </section>
        </TextOverlay>

        {showCarousel && (
          <ImageWrapper>
            <div className="about-image-container">
              <Carousel>
                {images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <GatsbyImage
                      image={image}
                      alt={`About section image ${index + 1}`}
                      className="about-image"
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>
          </ImageWrapper>
        )}
      </OverlappingContainer>
    </SectionContainer>
  )
}

export default AboutSection
