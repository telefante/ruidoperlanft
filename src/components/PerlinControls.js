import React from "react";
import { Form, InputGroup, Button, Container, Row } from "react-bootstrap";

const PerlinControls = ({
  usePerlin,
  setUsePerlin,
  amplitude,
  setAmplitude,
  scale,
  setScale,
  frequency,
  setFrequency,
  octaves,
  setOctaves,
  showCaptureButton,
  captureScene,
  controlsVisible,
  isMobile,
}) => {
  return (
    <Container
      className="controls"
      style={{
        position: 'absolute',
        top: '50px',
        left: '20px',
        width: '80%', // Adjusted for better responsiveness on mobile screens
        maxWidth: isMobile ? '90%' : '20%', // Set maxWidth based on mobile detection
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontFamily: 'var(--primary-font)',
        opacity: controlsVisible ? 1 : 0,
        transform: controlsVisible ? 'scale(1)' : 'scale(0.8)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        pointerEvents: controlsVisible ? 'auto' : 'none',
      }}
    >
      <Form>
        <Form.Group controlId="usePerlin">
          <Form.Check 
            type="checkbox"
            label="Use Perlin Noise (uncheck for Simplex)"
            checked={usePerlin}
            onChange={e => setUsePerlin(e.target.checked)}
            style={{ fontFamily: 'var(--primary-font)' }}
          />
        </Form.Group>

        {usePerlin && (
          <>
            <Form.Group controlId="frequency">
              <Form.Label>Frequency: {frequency}</Form.Label>
              <InputGroup>
                <Form.Control
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={frequency}
                  onChange={e => setFrequency(parseFloat(e.target.value))}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="octaves">
              <Form.Label>Octaves: {octaves}</Form.Label>
              <InputGroup>
                <Form.Control
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={octaves}
                  onChange={e => setOctaves(parseInt(e.target.value))}
                />
              </InputGroup>
            </Form.Group>
          </>
        )}

        <Form.Group controlId="amplitude">
          <Form.Label>Amplitude: {amplitude}</Form.Label>
          <InputGroup>
            <Form.Control
              type="range"
              min="0"
              max="30"
              step="0.1"
              value={amplitude}
              onChange={e => setAmplitude(parseFloat(e.target.value))}
            />
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="scale">
          <Form.Label>Noise Scale: {scale}</Form.Label>
          <InputGroup>
            <Form.Control
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
            />
          </InputGroup>
        </Form.Group>

        {showCaptureButton && (
          <Button variant="danger" onClick={captureScene} style={{ marginTop: '10px' }}>
            Capture and Mint
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default PerlinControls; 