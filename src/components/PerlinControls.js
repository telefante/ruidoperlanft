import React from "react";

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
    <div
      className="controls"
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
        width: isMobile ? "90%" : "20%",
        fontFamily: "var(--primary-font)",
      }}
    >
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
            onChange={e => setUsePerlin(e.target.checked)}
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
            max="25"
            step="0.5"
            value={amplitude}
            onChange={e => setAmplitude(parseFloat(e.target.value))}
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
            onChange={e => setScale(parseFloat(e.target.value))}
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
            onChange={e => setFrequency(parseFloat(e.target.value))}
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
            onChange={e => setOctaves(parseInt(e.target.value, 10))}
            style={{ width: "100%" }}
          />
          <span style={{ fontSize: "0.8rem", color: "white" }}>
            {octaves}
          </span>
        </label>
        {showCaptureButton && (
          <button
            onClick={captureScene}
            style={{
              backgroundColor: "#61dafb",
              color: "black",
              border: "none",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
              marginTop: "10px",
            }}
          >
            Capture Scene
          </button>
        )}
      </div>
    </div>
  );
};

export default PerlinControls;