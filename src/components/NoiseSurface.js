import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createNoise3D } from "simplex-noise";

const noise3D = createNoise3D();

// Example usage:
const noiseValue = noise3D(0.5, 0.5, 0.5);
console.log(noiseValue);
const NoiseSurface = () => {
  const mountRef = useRef(null);

  // Use state to store slider values.
  const [amplitude, setAmplitude] = useState(12.5); // Controls displacement amplitude.
  const [scale, setScale] = useState(0.008); // Controls noise scale (frequency).

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
    // camera.position.set(0, -100, 200);
    // camera.lookAt(0, 0, 0);
    camera.position.set(-5.01, -140.33, 52.22);
    camera.lookAt(-4.68, -54.15, 1.49);

    // Calculate lookAt point first
    const initialDirection = new THREE.Vector3();
    camera.getWorldDirection(initialDirection);
    const initialLookAtPoint = new THREE.Vector3();
    initialLookAtPoint.addVectors(camera.position, initialDirection.multiplyScalar(100));

    // Log initial camera setup
    console.log('Camera Setup Code:', `
    const camera = new THREE.PerspectiveCamera(
      75,                    // fov
      ${(width / height).toFixed(2)},  // aspect
      0.1,                   // near
      1000                   // far
    );
    camera.position.set(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)});
    camera.lookAt(${initialLookAtPoint.x.toFixed(2)}, ${initialLookAtPoint.y.toFixed(2)}, ${initialLookAtPoint.z.toFixed(2)});
    `);

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
      
      // Log the camera setup
      console.log('Camera Setup Code:', `
    camera.position.set(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)});
    camera.lookAt(${lookAtPoint.x.toFixed(2)}, ${lookAtPoint.y.toFixed(2)}, ${lookAtPoint.z.toFixed(2)});
      `);
    });

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
    // const simplex = new SimplexNoise();
    const simplex = createNoise3D();
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
        // const noise = simplex.noise3D(x * scaleRef.current, y * scaleRef.current, elapsed);
        const noise = noise3D(x * scaleRef.current, y * scaleRef.current, elapsed);
        // Displace the z coordinate using the current amplitude.
        positions[i + 2] = noise * amplitudeRef.current;
      }
      geometry.attributes.position.needsUpdate = true;

      // Update controls
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
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
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

export default NoiseSurface;
