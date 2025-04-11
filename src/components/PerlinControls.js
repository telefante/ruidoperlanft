import React, { useEffect, useState } from "react"
import Draggable from "react-draggable"
import { Button } from "react-bootstrap"

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
  setIsAutoAnimating, // Add this prop
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const toggleAnimation = () => {
    setIsAnimating((prev) => !prev)
    setIsAutoAnimating((prev) => !prev) // Update the parent state
  }

  useEffect(() => {
    let animationFrame
    if (isAnimating) {
      const animate = () => {
        setAmplitude((prev) => {
          const newValue = prev >= 50 ? 1 : prev + 0.5
          return newValue
        })
        setScale((prev) => {
          const newValue = prev >= 0.015 ? 0.001 : prev + 0.001
          return newValue
        })
        setFrequency((prev) => {
          const newValue = prev >= 5 ? 1 : prev + 0.1
          return newValue
        })
        setOctaves((prev) => {
          const newValue = prev >= 5 ? 1 : prev + 1
          return newValue
        })
        animationFrame = requestAnimationFrame(animate)
      }
      animate()
    } else {
      cancelAnimationFrame(animationFrame)
    }
    return () => cancelAnimationFrame(animationFrame)
  }, [isAnimating, setAmplitude, setScale, setFrequency, setOctaves])

  const handleAmplitudeChange = (e) => {
    setAmplitude(parseFloat(e.target.value))
  }

  const handleScaleChange = (e) => {
    setScale(parseFloat(e.target.value))
  }

  const handleFrequencyChange = (e) => {
    setFrequency(parseFloat(e.target.value))
  }

  const handleOctavesChange = (e) => {
    setOctaves(parseInt(e.target.value, 10))
  }

  const handlePerlinToggle = (e) => {
    setUsePerlin(e.target.checked)
  }

  return (
    <Draggable handle=".drag-handle" cancel="input, button, select, textarea">
      <div
        className="controls"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "5px",
          zIndex: 2000,
          width: isMobile ? "90%" : "20%",
          fontFamily: "var(--primary-font)",
        }}
      >
        <div className="drag-handle" style={{ cursor: "grab", padding: "5px", textAlign: "center", color: "white" }}>
          Drag Here
        </div>
        <h2
          style={{
            color: "white",
            fontSize: "1.2rem",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Perlin Noise Controls
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <label
            style={{
              color: "white",
              fontSize: "0.9rem",
              marginBottom: "5px",
            }}
          >
            Use Perlin Noise:
            <input
              type="checkbox"
              checked={usePerlin}
              onChange={handlePerlinToggle}
              style={{ marginLeft: "5px" }}
            />
          </label>
          <label
            style={{
              color: "white",
              fontSize: "0.9rem",
              marginBottom: "5px",
            }}
          >
            Amplitude:
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={amplitude}
              onChange={handleAmplitudeChange}
              onInput={handleAmplitudeChange}
              style={{ width: "100%" }}
            />
            <span style={{ fontSize: "0.8rem", color: "white" }}>
              {amplitude}
            </span>
          </label>
          <label
            style={{
              color: "white",
              fontSize: "0.9rem",
              marginBottom: "5px",
            }}
          >
            Scale:
            <input
              type="range"
              min="0.001"
              max="0.015"
              step="0.001"
              value={scale}
              onChange={handleScaleChange}
              onInput={handleScaleChange}
              style={{ width: "100%" }}
            />
            <span style={{ fontSize: "0.8rem", color: "white" }}>{scale}</span>
          </label>
          <label
            style={{
              color: "white",
              fontSize: "0.9rem",
              marginBottom: "5px",
            }}
          >
            Frequency:
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={frequency}
              onChange={handleFrequencyChange}
              onInput={handleFrequencyChange}
              style={{ width: "100%" }}
            />
            <span style={{ fontSize: "0.8rem", color: "white" }}>
              {frequency}
            </span>
          </label>
          <label
            style={{
              color: "white",
              fontSize: "0.9rem",
              marginBottom: "5px",
            }}
          >
            Octaves:
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={octaves}
              onChange={handleOctavesChange}
              onInput={handleOctavesChange}
              style={{ width: "100%" }}
            />
            <span style={{ fontSize: "0.8rem", color: "white" }}>
              {octaves}
            </span>
          </label>
          {showCaptureButton && (
            <Button
              variant="danger"
              onClick={captureScene}
              style={{
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1rem",
                marginTop: "10px",
                fontFamily: "var(--primary-font)",
                fontWeight: "bold",
                fontStyle: "italic",
              }}
            >
              Capture now!
            </Button>
          )}
          <Button
            variant="primary"
            onClick={toggleAnimation}
            style={{
              marginTop: "10px",
              fontFamily: "var(--primary-font)",
              fontWeight: "bold",
            }}
          >
            {isAnimating ? "Stop" : "random values"}
          </Button>
        </div>
      </div>
    </Draggable>
  )
}

export default PerlinControls
