import React, { useState } from "react"
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
  isAutoAnimating,
  setIsAutoAnimating,
  isCapturing,
}) => {
  const handleRandomizeParameters = () => {
    // Calculate target values
    const targetAmplitude = amplitude >= 50 ? 1 : amplitude + 5
    const targetScale = scale >= 0.015 ? 0.001 : scale + 0.002
    const targetFrequency = frequency >= 5 ? 1 : frequency + 0.5
    const targetOctaves = octaves >= 5 ? 1 : octaves + 1

    // Animate transitions over 800ms
    const duration = 800
    const steps = 40
    const interval = duration / steps

    let currentStep = 0
    const startAmplitude = amplitude
    const startScale = scale
    const startFrequency = frequency

    const animate = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      // Easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      setAmplitude(startAmplitude + (targetAmplitude - startAmplitude) * easeProgress)
      setScale(startScale + (targetScale - startScale) * easeProgress)
      setFrequency(startFrequency + (targetFrequency - startFrequency) * easeProgress)

      if (currentStep >= steps) {
        clearInterval(animate)
        setOctaves(targetOctaves)
      }
    }, interval)
  }

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
    <>
      <style>
        {`
          .controls input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            background: linear-gradient(to right, rgba(255, 10, 180, 0.3), rgba(255, 10, 180, 0.8));
            border-radius: 10px;
            height: 4px;
            outline: none;
          }

          .controls input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: var(--primary-color, #ff0ab4);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(255, 10, 180, 0.5);
            transition: all 0.2s ease;
          }

          @media (max-width: 768px) {
            .controls input[type="range"]::-webkit-slider-thumb {
              width: 24px;
              height: 24px;
            }

            .controls input[type="range"]::-moz-range-thumb {
              width: 24px;
              height: 24px;
            }
          }

          .controls input[type="range"]::-webkit-slider-thumb:hover {
            box-shadow: 0 0 15px rgba(255, 10, 180, 0.8);
            transform: scale(1.1);
          }

          .controls input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: var(--primary-color, #ff0ab4);
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(255, 10, 180, 0.5);
            transition: all 0.2s ease;
          }

          .controls input[type="range"]::-moz-range-thumb:hover {
            box-shadow: 0 0 15px rgba(255, 10, 180, 0.8);
            transform: scale(1.1);
          }

          .controls label {
            color: rgba(255, 255, 255, 0.85);
            font-size: 0.85rem;
            font-weight: 500;
            letter-spacing: 0.05em;
          }
        `}
      </style>
      <Draggable handle=".drag-handle" cancel="input, button, select, textarea">
        <div
          className="controls"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "linear-gradient(135deg, rgba(83, 55, 119, 0.15) 0%, rgba(0, 0, 0, 0.25) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          zIndex: 2000,
          width: isMobile ? "90%" : "20%",
          fontFamily: "var(--primary-font)",
        }}
      >
        <div className="drag-handle" style={{ cursor: "grab", padding: "8px", textAlign: "center", color: "rgba(255, 255, 255, 0.4)", fontSize: "1.5rem", letterSpacing: "0.5em" }}>
          ⋮⋮⋮
        </div>
        <h2
          style={{
            color: "white",
            fontSize: "1.2rem",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Shape the Noise
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
            Autonomous Drift:
            <input
              type="checkbox"
              checked={isAutoAnimating}
              onChange={(e) => setIsAutoAnimating(e.target.checked)}
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
            Wave Height:
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
            Grain:
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
            Rhythm:
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
            Layers:
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
              disabled={isCapturing}
              style={{
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: isCapturing ? "wait" : "pointer",
                fontSize: "1rem",
                marginTop: "10px",
                fontFamily: "var(--primary-font)",
                fontWeight: "bold",
                fontStyle: "italic",
                opacity: isCapturing ? 0.7 : 1,
              }}
            >
              {isCapturing ? "Rendering memory..." : "Preserve this Moment"}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleRandomizeParameters} // Call the new function
            style={{
              marginTop: "10px",
              fontFamily: "var(--primary-font)",
              fontWeight: "bold",
            }}
          >
            Let Chance Decide
          </Button>
        </div>
      </div>
      </Draggable>
    </>
  )
}

export default PerlinControls
