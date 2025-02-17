import React from "react";
import { Row, Col } from "react-bootstrap";
import SectionContainer from "./SectionContainer";

import PerlinNoise from "../PerlinNoise";

const SimulationSection = ({ account, connectWallet, disconnectWallet }) => {
  // Define surface parameters for simulation
  const surfaceParams = {
    amplitude: 20,      // Larger amplitude for more dramatic waves
    scale: 0.015,       // Slightly larger scale for more visible patterns
    frequency: 1.5,     // Moderate frequency for smooth animation
    octaves: 3,         // More octaves for complex detail
    usePerlin: true,    // Using Perlin noise for smoother transitions
    colors: {
      solid: {
        color: 0x00ff00,    // Neon green for solid mesh
        opacity: 0.6        // Semi-transparent
      },
      wireframe: {
        color: 0xffffff,    // White for wireframe
        opacity: 0.8        // More visible wireframe
      }
    }
  };

  // Define camera initialization parameters
  const cameraParams = {
    position: { x: -0.00, y: 190.13, z: 0.00 },
    lookAt: { x: -0.00, y: 90.13, z: 0.00 }
  };

  // Define the connectWallet function if not passed as a prop
  const handleConnectWallet = async () => {
    // Logic to connect to the wallet
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Connected account:", accounts[0]);
        // You can set the account state here if needed
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install a wallet extension like MetaMask.");
    }
  };

  return (
    <SectionContainer id="simulation" isGridLayout={false}>
      <Row className="align-items-center mb-4">
        <Col xs={12} md={3}>
          <h2 className="simulation-title">Simulation</h2>
        </Col>
      </Row>
      
      {/* Full viewport width and height container */}
      <div style={{ 
        width: '100vw', 
        height: '66vh',
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)',
        marginBottom: '0px' // Add space for controls
      }}>
        <PerlinNoise 
          showControls={true}
          enableOrbit={true}
          initialParams={surfaceParams}
          cameraParams={cameraParams}
          account={account}
          connectWallet={handleConnectWallet}
          disconnectWallet={disconnectWallet}
        />
      </div>
    </SectionContainer>
  );
};

export default SimulationSection;