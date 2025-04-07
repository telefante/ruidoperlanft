import React, { useState } from "react"
import { Button } from "react-bootstrap"
// import { Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import styled from "styled-components"
import SectionContainer from "./SectionContainer"
import { Carousel } from "react-bootstrap"
import Video from "./Video"
import ExplanationModal from "../modals/ExplanationModal"

const OverlappingContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  margin-top: 2rem;
`

const TextOverlay = styled.div`
  position: absolute;
  top: -12rem;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  z-index: 2;
  max-width: 500px;
  border-radius: 15px;
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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const AboutSection = () => {
  const [showCarousel, setShowCarousel] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

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

  // const videoUrl =
  //   data.videoFiles.nodes.length > 0 ? data.videoFiles.nodes[0].publicURL : null
  const images = data.imageFiles.nodes.map(node =>
    getImage(node.childImageSharp)
  )

  const handlePlayVideo = () => {
    setShowVideo(true)
  }

  const handleCloseVideo = () => {
    setShowVideo(false)
  }

  return (
    <SectionContainer id="about">
      <OverlappingContainer>
        {/* {videoUrl && (
          <>
            {showVideo && (
              <Overlay onClick={handleCloseVideo}>
                <Video url={videoUrl} />
              </Overlay>
            )}
          </>
        )} */}
        <TextOverlay>
          <h2 className="simulation-title">Installation</h2>
          <section>
            <p>
              Gain behind-the-scenes insight into the creative process of „Ruido
              Perla NFT.“ Discover the inspiration, challenges, and integration
              of simulation, art, and net-based interaction that bring this
              unique NFT collection to life. Learn how poetry and generative
              landscapes intertwine to explore the relationship between noise
              and the pearl.
            </p>
            {/* <Button
              variant="outline-light"
              style={{
                fontFamily: "var(--primary-font)",
                fontStyle: "italic",
                fontSize: "1.2rem",
                padding: "10px 20px",
                borderRadius: "5px",
              }}
              onClick={handlePlayVideo}
            >
              See Video ..{" "}
            </Button> */}

            <Button
              variant="danger"
              style={{
                fontFamily: "var(--primary-font)",
                fontStyle: "italic",
                fontSize: "1.2rem",
                padding: "10px 20px",
                borderRadius: "5px",
              }}
              onClick={() => setShowAbout(true)}
            >
              What is Ruido Perla?
            </Button>
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

        <ExplanationModal show={showAbout} onHide={() => setShowAbout(false)} />
      </OverlappingContainer>
    </SectionContainer>
  )
}

export default AboutSection
