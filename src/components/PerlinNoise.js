import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Perlin } from 'three-noise';
import { createNoise3D } from "simplex-noise";
import { useStaticQuery, graphql } from "gatsby";
import html2canvas from 'html2canvas';

// Replace TextOverlay component with a Three.js text implementation
const createTextSprite = (text) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  // Make canvas even larger
  canvas.width = 4096;
  canvas.height = 4096;
  
  // Start with a smaller font size and measure
  context.font = 'bold 200px var(--primary-font)';
  const metrics = context.measureText(text);
  
  // Calculate font size to fill most of the canvas width
  const targetWidth = canvas.width * 0.8; // Use 80% of canvas width
  const scaleFactor = targetWidth / metrics.width;
  const fontSize = Math.min(2000, Math.floor(200 * scaleFactor)); // Cap at 2000px to prevent issues
  
  // Apply calculated font size
  context.font = `bold ${fontSize}px var(--primary-font)`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Add a subtle background
  context.fillStyle = 'rgba(0, 0, 0, 0.3)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw text
  context.fillStyle = 'white';
  context.fillText(text, canvas.width/2, canvas.height/2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  
  const spriteMaterial = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    sizeAttenuation: false
  });
  
  const sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
};

// Update sprite position function
const updateSpritePosition = (sprite, camera) => {
  if (!sprite) return;
  
  // Position in normalized device coordinates
  sprite.position.set(0, 0, 1);
  
  // Make sprite face the camera
  sprite.material.depthTest = false;
  sprite.material.depthWrite = false;
  
  // Make sprite even larger
  sprite.scale.set(100, 100, 1); // Increased scale significantly
};

const PerlinNoise = () => {
  // Move useStaticQuery to component level
  const data = useStaticQuery(graphql`
    query {
      markdownRemark(fileAbsolutePath: { regex: "/perlin-text.md/" }) {
        rawMarkdownBody
      }
    }
  `);

  const mountRef = useRef(null);
  const containerRef = useRef(null);
  // Add refs for scene, camera, and renderer
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const textSpriteRef = useRef(null);
  const currentTextRef = useRef('');
  const overlaySceneRef = useRef(null);
  const overlayCameraRef = useRef(null);

  // Add state for noise type
  const [usePerlin, setUsePerlin] = useState(true);
  const [amplitude, setAmplitude] = useState(12.5); // Controls displacement amplitude.
  const [scale, setScale] = useState(0.008); // Controls noise scale (frequency).
  const [frequency, setFrequency] = useState(1);
  const [octaves, setOctaves] = useState(1);
  const [textOpacity, setTextOpacity] = useState(1);

  // Add ref for noise type
  const usePerlinRef = useRef(usePerlin);
  const amplitudeRef = useRef(amplitude);
  const scaleRef = useRef(scale);
  const frequencyRef = useRef(frequency);
  const octavesRef = useRef(octaves);

  // Add ref for camera setup
  const cameraSetupRef = useRef({ position: {x: 0, y: 0, z: 0}, lookAt: {x: 0, y: 0, z: 0} });

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

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Main scene setup as before...
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create overlay scene and camera
    const overlayScene = new THREE.Scene();
    const overlayCamera = new THREE.OrthographicCamera(
      -width,
      width,
      height,
      -height,
      -100,
      100
    );
    overlayCamera.position.z = 0;  // Camera at origin
    
    overlaySceneRef.current = overlayScene;
    overlayCameraRef.current = overlayCamera;

    // Create text overlay with sprite
    const createTextPlane = (text) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = width * 16;     // Increased from 8 to 16
      canvas.height = height * 16;    // Increased from 8 to 16

      // Setup text style with much larger font
      const fontSize = height * 8;    // Increased from 4 to 8
      context.font = `bold ${fontSize}px var(--primary-font)`;
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Draw text
      context.fillText(text, canvas.width/2, canvas.height/2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Use SpriteMaterial instead of MeshBasicMaterial
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        sizeAttenuation: true  // Changed to true to allow manual scaling
      });

      // Create sprite instead of mesh
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(width * 8, height * 8, 1);  // Much larger scale (4x previous)
      sprite.position.set(0, 0, -5);  // Moved closer to camera
      sprite.renderOrder = 999;
      return sprite;
    };

    // Text animation
    const lines = data.markdownRemark.rawMarkdownBody.split('\n').filter(line => line.trim());
    let currentIndex = 0;

    const updateText = () => {
      setTextOpacity(0);
      setTimeout(() => {
        currentTextRef.current = lines[currentIndex];
        setTextOpacity(1);
        currentIndex = (currentIndex + 1) % lines.length;
      }, 500);
    };

    const textInterval = setInterval(updateText, 5000);

    // Animation loop
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

      // Render main scene with perspective camera
      rendererRef.current.render(scene, camera);
      
      // Render text overlay with orthographic camera
      rendererRef.current.autoClear = false;
      rendererRef.current.render(overlayScene, overlayCamera);
      rendererRef.current.autoClear = true;

      controls.update();
    };

    // Handle resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      // Update main camera
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      // Update overlay camera
      overlayCamera.left = -width;
      overlayCamera.right = width;
      overlayCamera.top = height;
      overlayCamera.bottom = -height;
      overlayCamera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      
      // Update text if it exists
      if (textSpriteRef.current) {
        const newText = currentTextRef.current;
        overlayScene.remove(textSpriteRef.current);
        const textPlane = createTextPlane(newText);
        overlayScene.add(textPlane);
        textSpriteRef.current = textPlane;
      }
    };

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;

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
      
      // Store current camera setup in a ref for the copy button
      cameraSetupRef.current = {
        position: {
          x: camera.position.x.toFixed(2),
          y: camera.position.y.toFixed(2),
          z: camera.position.z.toFixed(2)
        },
        lookAt: {
          x: lookAtPoint.x.toFixed(2),
          y: lookAtPoint.y.toFixed(2),
          z: lookAtPoint.z.toFixed(2)
        }
      };
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

    // Create initial text sprite
    const textSprite = createTextSprite('');
    scene.add(textSprite);
    textSpriteRef.current = textSprite;

    animate();

    // Handle window resizing.
    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount.
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      controls.removeEventListener('change', () => {});
      controls.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      clearInterval(textInterval);
      if (overlayScene) {
        overlayScene.clear();
      }
    };
  }, [data]); // Add data to dependencies

  // Update capture function to include both scenes and CSS overlay
  const captureScene = async () => {
    if (!containerRef.current) return;

    try {
      // Capture the entire container including 3D and CSS overlay
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
        ignoreElements: (element) => {
          // Ignore control buttons and sliders
          return element.classList.contains('controls') || 
                 element.tagName === 'BUTTON';
        }
      });

      // Convert to image and trigger download
      const imageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `perlin-capture-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Error capturing scene:', error);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Text Overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '8vw', // Dynamic font size based on viewport width
        fontFamily: 'var(--primary-font)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 1000,
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        opacity: textOpacity, // Add state for fade effect
        transition: 'opacity 0.5s ease-in-out'
      }}>
        {currentTextRef.current}
      </div>

      {/* Add Capture Button next to Camera Setup button */}
      <div className="controls" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={captureScene}
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--primary-font)',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          Capture Scene
        </button>

        {/* Existing Camera Setup button */}
        <button
          onClick={() => {
            const cameraSetup = cameraSetupRef.current;
            const text = `camera.position.set(${cameraSetup.position.x}, ${cameraSetup.position.y}, ${cameraSetup.position.z});
camera.lookAt(${cameraSetup.lookAt.x}, ${cameraSetup.lookAt.y}, ${cameraSetup.lookAt.z});`;
            navigator.clipboard.writeText(text);
          }}
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--primary-font)',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          Copy Camera Setup
        </button>
      </div>

      {/* Slider Controls */}
      <div
        className="controls"
        style={{
          position: "absolute",
          bottom: "-180px",
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

        {/* Controls info */}
        <div style={{ marginBottom: "10px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px 0" }}>Controls:</p>
          <p style={{ margin: "0", fontSize: "12px" }}>
            Orbit: Left Mouse Button | Zoom: Mouse Wheel | Pan: Right Mouse Button
          </p>
        </div>
      </div> 
    </div>
  );
};

export default PerlinNoise;
