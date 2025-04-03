import React, { useState } from "react"
import { Row, Col, Button } from "react-bootstrap"
import SectionContainer from "./SectionContainer"
import styled from "styled-components"
import PerlinNoise from "../PerlinNoise"
import { useTracking } from "../../contexts/TrackingContext"



const SimulationSection = ({ account, connectWallet, disconnectWallet }) => {
  const [controlsVisible, setControlsVisible] = useState(true) // Define the state
  const COLLECTION_CONTRACT = process.env.GATSBY_RUIDOPERLANFT_CONTRACT
  const { trackEvent } = useTracking()

  // Define surface parameters for simulation
  const surfaceParams = {
    amplitude: 20, // Larger amplitude for more dramatic waves
    scale: 0.015, // Slightly larger scale for more visible patterns
    frequency: 1.5, // Moderate frequency for smooth animation
    octaves: 3, // More octaves for complex detail
    usePerlin: true, // Using Perlin noise for smoother transitions
    colors: {
      solid: {
        color: 0x00ff00, // Neon green for solid mesh
        opacity: 0.6, // Semi-transparent
      },
      wireframe: {
        color: 0xffffff, // White for wireframe
        opacity: 0.8, // More visible wireframe
      },
    },
  }

  // Define camera initialization parameters
  const cameraParams = {
    position: { x: -0.0, y: 190.13, z: 0.0 },
    lookAt: { x: -0.0, y: 90.13, z: 0.0 },
  }

  // Define the connectWallet function if not passed as a prop
  const handleConnectWallet = async () => {
    // Logic to connect to the wallet
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        console.log("Connected account:", accounts[0])
        // You can set the account state here if needed
      } catch (error) {
        console.error("Error connecting to wallet:", error)
      }
    } else {
      alert("Please install a wallet extension like MetaMask.")
    }
  }

  const queryFile = "perlin-text.md" // Specify the file name

  const DescriptionText = styled.p`
    max-width: 80vw;
    text-align: justify;
    font-size: 1.2rem;
    @media (max-width: 768px) {
      max-width: 90vw;
    }
  `

  const handleCollectNowClick = (url) => {
    console.log("Clicked on Collection: ", url)
    trackEvent(`clicked on Collection in section simulation`);
  }

  return (
    <SectionContainer id="simulation" isGridLayout={false}>
      <Row className="align-items-center mb-4">
        <Col xs={12} md={3}>
          <h2 className="simulation-title">Mint Poetry from Simulation</h2>
        </Col>
      </Row>

      <DescriptionText>
        
          Ruido Perla is a unique NFT collection of poetry and digital
          simulation 
          <br />
          Collectors don’t just own an artwork— they gain access to control thesimulation.
       
      </DescriptionText>
      <Row>
        
        <Button
          href={`${process.env.GATSBY_OBJKT_COLLECTION_URL}/${COLLECTION_CONTRACT}`}
          target="_blank"
          variant="primary"
          style={{
            fontFamily: "var(--primary-font)",
            fontStyle: "italic",
            fontWeight: "bold",
            fontSize: "1.2rem",
            maxWidth: "200px",
          }}
          onClick={handleCollectNowClick(`${process.env.GATSBY_OBJKT_COLLECTION_URL}/${COLLECTION_CONTRACT}`)}
        >
          Collect now
        </Button>
      </Row>

      {/* Full viewport width and height container */}
      <div

      
        style={{
          width: "100vw",
          height: "66vh",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          marginBottom: "0px", // Add space for controls
        }}
      >
        <PerlinNoise
          showControls={true}
          enableOrbit={true}
          initialParams={surfaceParams}
          cameraParams={cameraParams}
          account={account}
          connectWallet={handleConnectWallet}
          disconnectWallet={disconnectWallet}
          showCaptureButton={false}
          queryFile={queryFile}
          fontSize="8vw"
          controlsVisible={controlsVisible} // Pass the state
          setControlsVisible={setControlsVisible} // Pass the setter function
        />
      </div>
    </SectionContainer>
  )
}

export default SimulationSection
