import React from "react"
import { Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import styled from "styled-components"
import SectionContainer from "./SectionContainer"

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
  const data = useStaticQuery(graphql`
    query {
      file(
        sourceInstanceName: { eq: "images" }
        name: { eq: "about" }  # Make sure you have an image named "about" in your images folder
      ) {
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
  `)

  const image = getImage(data.file)

  return (
    <SectionContainer id="about" title="About">
      <OverlappingContainer>
        <TextOverlay>
          <h2 className="about-title">About</h2>
          <section>
            <p>
              This project is focused on creating innovative digital experiences.
              Through the fusion of technology and art, we explore new frontiers
              in digital expression and interactive media.
            </p>
            <StyledButton to="/details">Learn More</StyledButton>
          </section>
        </TextOverlay>
        
        <ImageWrapper>
          <div className="about-image-container">
            {image && (
              <GatsbyImage
                image={image}
                alt="About section image"
                className="about-image"
              />
            )}
          </div>
        </ImageWrapper>
      </OverlappingContainer>
    </SectionContainer>
  )
}

export default AboutSection