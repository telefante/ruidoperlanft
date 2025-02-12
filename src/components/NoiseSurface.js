import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import SimplexNoise from "simplex-noise";

const PeelingSurface = () => {
  const mountRef = useRef(null);

  // Use state to store slider values.
  const [amplitude, setAmplitude] = useState(15); // Controls displacement amplitude.
  const [scale, setScale] = useState(0.05); // Controls noise scale (frequency).

  // Use refs to hold the current values so the animate loop always reads the latest values.
  const amplitudeRef = useRef(amplitude);
  const scaleRef = useRef(scale);

  // Update the refs whenever state changes.
  useEffect(() => {
    amplitudeRef.current = amplitude;
  }, [amplitude]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Get container dimensions.
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Create scene, camera, and renderer.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 150;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background.
    mountRef.current.appendChild(renderer.domElement);

    // Create a plane geometry with many segments.
    const planeWidth = 200;
    const planeHeight = 200;
    const segments = 100;
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segments, segments);

    // Use a wireframe material to clearly show the distortion.
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });

    const planeMesh = new THREE.Mesh(geometry, material);
    scene.add(planeMesh);

    // Create a noise generator.
    const simplex = new SimplexNoise();
    const clock = new THREE.Clock();

    // Animation loop.
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update vertex positions.
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];

        // Compute a noise value. Multiplying x and y by the noise scale controls frequency.
        const noise = simplex.noise3D(x * scaleRef.current, y * scaleRef.current, elapsed);
        // Displace the z coordinate using the current amplitude.
        positions[i + 2] = noise * amplitudeRef.current;
      }
      geometry.attributes.position.needsUpdate = true;

      // Optional: Slowly rotate the plane.
      planeMesh.rotation.z += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resizing.
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount.
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Slider Controls */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <label>
            Amplitude: {amplitude}
            <input
              type="range"
              min="0"
              max="30"
              step="0.1"
              value={amplitude}
              onChange={(e) => setAmplitude(parseFloat(e.target.value))}
              style={{ marginLeft: "10px" }}
            />
          </label>
        </div>
        <div>
          <label>
            Noise Scale: {scale}
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              style={{ marginLeft: "10px" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default PeelingSurface;
