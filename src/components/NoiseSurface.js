import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Perlin } from 'three-noise';
import { createNoise3D } from "simplex-noise";

const NoiseSurface = () => {
  const mountRef = useRef(null);

  // Add state for noise type
  const [usePerlin, setUsePerlin] = useState(true);
  const [amplitude, setAmplitude] = useState(12.5); // Controls displacement amplitude.
  const [scale, setScale] = useState(0.008); // Controls noise scale (frequency).
  const [frequency, setFrequency] = useState(1);
  const [octaves, setOctaves] = useState(1);

  // Add ref for noise type
  const usePerlinRef = useRef(usePerlin);
  const amplitudeRef = useRef(amplitude);
  const scaleRef = useRef(scale);
  const frequencyRef = useRef(frequency);
  const octavesRef = useRef(octaves);

  // Update refs when state changes
  useEffect(() => {
    usePerlinRef.current = usePerlin;
  }, [usePerlin]);

  useEffect(() => {
    amplitudeRef.current = amplitude;
  }, [amplitude]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    frequencyRef.current = frequency;
  }, [frequency]);

  useEffect(() => {
    octavesRef.current = octaves;
  }, [octaves]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Get container dimensions.
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Create scene, camera, and renderer.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    // camera.position.set(0, -100, 200);
    // camera.lookAt(0, 0, 0);
    camera.position.set(-5.01, -140.33, 52.22);
    camera.lookAt(-4.68, -54.15, 1.49);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background.
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 50;
    controls.maxDistance = 400;

    // Update the orbit controls event listener
    controls.addEventListener('change', () => {
      // Calculate new lookAt point
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const lookAtPoint = new THREE.Vector3();
      lookAtPoint.addVectors(camera.position, direction.multiplyScalar(100));
    });

    // Create a plane geometry with many segments.
    const planeWidth = 200;
    const planeHeight = 200;
    const segments = 33;
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segments, segments);

    // Replace the existing material setup with these two materials
    const solidMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });

    // Create two meshes using the same geometry
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    
    // Add both meshes to the scene
    scene.add(solidMesh);
    scene.add(wireframeMesh);

    // Setup both noise generators
    const perlin = new Perlin();  // Create basic Perlin instance without parameters
    const simplex = createNoise3D();
    const clock = new THREE.Clock();
    const noiseVector = new THREE.Vector3();

    // Animation loop.
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update vertex positions using selected noise type
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        let noise;
        if (usePerlinRef.current) {
          // Apply frequency and octaves manually
          let totalNoise = 0;
          let amplitude = 1;
          let frequency = frequencyRef.current;
          
          // Sum multiple octaves of noise
          for(let o = 0; o < octavesRef.current; o++) {
            noiseVector.set(
              x * scaleRef.current * frequency, 
              y * scaleRef.current * frequency, 
              elapsed
            );
            totalNoise += perlin.get3(noiseVector) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
          }
          
          noise = totalNoise;
        } else {
          noise = simplex(x * scaleRef.current, y * scaleRef.current, elapsed);
        }
        
        positions[i + 2] = noise * amplitudeRef.current;
      }
      geometry.attributes.position.needsUpdate = true;

      controls.update();
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
      controls.removeEventListener('change', () => {});
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "33vh" }}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Slider Controls */}
      <div
        style={{
          position: "absolute",
          bottom: "-180px", // Adjusted to make room for new controls
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.8)", 
          padding: "10px",
          borderRadius: "5px",
          fontFamily: "var(--primary-font)",
          fontSize: "14px",
          letterSpacing: "0.5px"
        }}
      >
        {/* Add noise type toggle */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={usePerlin}
              onChange={(e) => setUsePerlin(e.target.checked)}
              style={{ marginRight: "10px" }}
            />
            Use Perlin Noise (uncheck for Simplex)
          </label>
        </div>

        {/* Perlin-specific controls that only show when Perlin is selected */}
        {usePerlin && (
          <>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <span style={{ minWidth: "120px" }}>Frequency: {frequency}</span>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={frequency}
                  onChange={(e) => setFrequency(parseFloat(e.target.value))}
                  style={{ marginLeft: "10px" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <span style={{ minWidth: "120px" }}>Octaves: {octaves}</span>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={octaves}
                  onChange={(e) => setOctaves(parseInt(e.target.value))}
                  style={{ marginLeft: "10px" }}
                />
              </label>
            </div>
          </>
        )}

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "flex", alignItems: "center" }}>
            <span style={{ minWidth: "120px" }}>Amplitude: {amplitude}</span>
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
          <label style={{ display: "flex", alignItems: "center" }}>
            <span style={{ minWidth: "120px" }}>Noise Scale: {scale}</span>
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

export default NoiseSurface;
