import React, { useState } from "react"
import { Button, Container } from "react-bootstrap"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import styled from "styled-components"
import ExplanationModal from "../modals/ExplanationModal"

const FullscreenSection = styled.section`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.8s ease-out, opacity 0.8s ease-out;
  opacity: 0;
  transform: translateY(50px);

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
`

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  .gatsby-image-wrapper {
    width: 100%;
    height: 100%;
    filter: grayscale(100%) !important;
    opacity: 0.5;
    
    img {
      object-fit: cover !important;
      object-position: center !important;
    }
  }
`

const ContentOverlay = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  
  h2 {
    font-family: var(--primary-font);
    font-weight: 700;
    font-style: italic;
    color: var(--primary-color);
    font-size: 3rem;
    margin-bottom: 2rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  p {
    font-family: var(--primary-font);
    font-size: 1.5rem;
    color: var(--primary-color);
    line-height: 1.6;
    margin-bottom: 1.5rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    
    a {
      color: var(--bs-primary);
      text-decoration: none;
      transition: color 0.3s ease;
      
      &:hover {
        color: #ff4081;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;
    
    h2 {
      font-size: 2.5rem;
    }
    
    p {
      font-size: 1.2rem;
    }
  }
`

const StyledButton = styled(Button)`
  font-family: var(--primary-font) !important;
  font-style: italic !important;
  font-weight: 700 !important;
  font-size: 1.2rem !important;
  padding: 10px 20px !important;
  border-radius: 5px !important;
  background-color: var(--bs-primary) !important;
  border: none !important;
  transition: all 0.3s ease !important;
  text-shadow: none !important;
  
  &:hover {
    background-color: #d81b60 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`

const AboutSection = () => {
  const [showAbout, setShowAbout] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const data = useStaticQuery(graphql`
    query {
      imageFiles: allFile(
        filter: {
          sourceInstanceName: { eq: "images" }
          relativeDirectory: { eq: "about" }
        }
      ) {
        nodes {
          childImageSharp {
            gatsbyImageData(
              width: 1920
              height: 1080
              quality: 85
              placeholder: BLURRED
              formats: [AUTO, WEBP]
            )
          }
        }
      }
    }
  `)

  // Get the first image as the background
  const backgroundImage = data.imageFiles.nodes[0] 
    ? getImage(data.imageFiles.nodes[0].childImageSharp)
    : null

  // Intersection Observer for animation
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    )
    const section = document.getElementById('about')
    if (section) observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <FullscreenSection id="about" className={isVisible ? "visible" : ""}>
      {backgroundImage && (
        <BackgroundImage>
          <GatsbyImage
            image={backgroundImage}
            alt="Ruido Perla Installation Background"
            style={{ width: "100%", height: "100%" }}
          />
        </BackgroundImage>
      )}
      
      <ContentOverlay>
        <h2>Installation</h2>
        <p>
          Ruido Perla explores the poetics of the unpredictable, finding pearls of meaning 
          within the noise of existence. This digital ecosystem transforms chaos into beauty 
          through the language of algorithms and the poetry of chance.
        </p>
        <p>
          Ruido Perla was conceived from <a href="https://dossier.audiovisiones.info" target="_blank" rel="noreferrer">Luis Negrón van Grieken's</a> installation in <a href="https://galerie-im-koernerpark.de/de/ausstellungen/enter-nature" target="_blank" rel="noreferrer">Berlin</a>. 
          Now, its echoes live on through generative NFTs, poetic simulations, and interactive memory.
        </p>

        <StyledButton onClick={() => setShowAbout(true)}>
          What is Ruido Perla?
        </StyledButton>
      </ContentOverlay>

      <ExplanationModal show={showAbout} onHide={() => setShowAbout(false)} />
    </FullscreenSection>
  )
}

export default AboutSection
