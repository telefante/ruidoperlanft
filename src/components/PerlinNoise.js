import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Perlin } from "three-noise";
import { createNoise3D } from "simplex-noise";
import html2canvas from "html2canvas";
import { useStaticQuery, graphql } from "gatsby";
import { Modal, Button, Row, Container } from "react-bootstrap";
import PerlinControls from "./PerlinControls";
import { useWallet } from "./WalletContext";
import UploadImageWithWallet from "./UploadImagewithWallet";
import NFTVerification from "./NFTVerification";

const PerlinNoise = ({
  showControls = true,
  enableOrbit = true,
  initialParams = {
    amplitude: 12.5,
    scale: 0.008,
    frequency: 1,
    octaves: 1,
    usePerlin: true,
  },
  cameraParams = null,
  showCaptureButton,
  queryFile,
  fontSize,
  controlsVisible,
  setControlsVisible,
}) => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark {
        nodes {
          fileAbsolutePath
          rawMarkdownBody
        }
      }
      site {
        siteMetadata {
          contractNumber
          rpcUrl
        }
      }
    }
  `);

  const text =
    data.allMarkdownRemark.nodes.find(node =>
      node.fileAbsolutePath.includes(queryFile)
    )?.rawMarkdownBody || "";

  const mountRef = useRef(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const { walletAddress, isConnected } = useWallet();

  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const currentTextRef = useRef("");

  const [usePerlin, setUsePerlin] = useState(initialParams.usePerlin);
  const [amplitude, setAmplitude] = useState(initialParams.amplitude);
  const [scale, setScale] = useState(initialParams.scale);
  const [frequency, setFrequency] = useState(initialParams.frequency);
  const [octaves, setOctaves] = useState(initialParams.octaves);
  const [textOpacity, setTextOpacity] = useState(1);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const usePerlinRef = useRef(usePerlin);
  const amplitudeRef = useRef(amplitude);
  const scaleRef = useRef(scale);
  const frequencyRef = useRef(frequency);
  const octavesRef = useRef(octaves);

  const cameraSetupRef = useRef({
    position: { x: 0, y: 0, z: 0 },
    lookAt: { x: 0, y: 0, z: 0 },
  });

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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    if (cameraParams) {
      const { position, lookAt } = cameraParams;
      camera.position.set(position.x, position.y, position.z);
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    } else {
      camera.position.set(0, 100, 200);
      camera.lookAt(0, 0, 0);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    sceneRef.current = scene;
    cameraRef.current = camera;

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];

        let noise;
        if (usePerlinRef.current) {
          let totalNoise = 0;
          let amplitude = 1;
          let frequency = frequencyRef.current;

          for (let o = 0; o < octavesRef.current; o++) {
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

      rendererRef.current.render(scene, camera);
      controls.update();
    };

    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    const clock = new THREE.Clock();
    const noiseVector = new THREE.Vector3();
    const perlin = new Perlin();
    const simplex = createNoise3D();

    const lines = text
      .split("\n")
      .filter(line => line.trim());
    let currentIndex = 0;

    const updateText = () => {
      setTextOpacity(0);
      setTimeout(() => {
        setTextOpacity(0);
        setTimeout(() => {
          currentTextRef.current = lines[currentIndex];
          setTextOpacity(1);
          currentIndex = (currentIndex + 1) % lines.length;
        }, 500);
      }, 500);
    };

    updateText();

    const textInterval = setInterval(updateText, 5000);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false;
    controls.minDistance = 50;
    controls.maxDistance = 400;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = event => {
      const rect = renderer.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects([solidMesh, wireframeMesh]);

      if (enableOrbit) {
        controls.enabled = intersects.length > 0;
        renderer.domElement.style.cursor =
          intersects.length > 0 ? "grab" : "default";
      }
    };

    const onPointerDown = () => {
      if (controls.enabled) {
        renderer.domElement.style.cursor = "grabbing";
      }
    };

    const onPointerUp = () => {
      if (controls.enabled) {
        renderer.domElement.style.cursor = "grab";
      }

      console.log("position", camera.position);
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const lookAtPoint = new THREE.Vector3();
      lookAtPoint.addVectors(camera.position, direction.multiplyScalar(100));
      console.log("lookAt", lookAtPoint);
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const lookAtPoint = new THREE.Vector3();
    lookAtPoint.addVectors(camera.position, direction.multiplyScalar(100));

    console.log("position", camera.position);

    cameraSetupRef.current = {
      position: {
        x: camera.position.x.toFixed(2),
        y: camera.position.y.toFixed(2),
        z: camera.position.z.toFixed(2),
      },
      lookAt: {
        x: lookAtPoint.x.toFixed(2),
        y: lookAtPoint.y.toFixed(2),
        z: lookAtPoint.z.toFixed(2),
      },
    };

    const planeWidth = 200;
    const planeHeight = 200;
    const segments = 17;
    const geometry = new THREE.PlaneGeometry(
      planeWidth,
      planeHeight,
      segments,
      segments
    );

    const solidMaterial = new THREE.MeshBasicMaterial({
      color: initialParams.colors?.solid?.color || 0x000000,
      transparent: true,
      opacity: initialParams.colors?.solid?.opacity || 0.6,
      side: THREE.DoubleSide,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: initialParams.colors?.wireframe?.color || 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: initialParams.colors?.wireframe?.opacity || 0.8,
    });

    const solidMesh = new THREE.Mesh(geometry, solidMaterial);
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

    scene.add(solidMesh);
    scene.add(wireframeMesh);

    animate();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      controls.removeEventListener("change", () => {});
      controls.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      clearInterval(textInterval);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
    };
  }, [data, enableOrbit, cameraParams]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaQueryChange = e => {
      setIsMobile(e.matches);
    };

    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    if (walletAddress && isConnected) {
      console.log("🔍 Wallet connected, verifying NFT ownership...");
    } else {
      console.log("⚠️ No wallet connected, restricting access.");
      setAccessGranted(false);
    }
  }, [walletAddress, isConnected]);

  const captureScene = async () => {
    if (!containerRef.current) return;

    try {
      const capturedCanvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
        logging: true,

        ignoreElements: element => {
          return (
            element.classList.contains("controls") ||
            element.classList.contains("minimize-button") ||
            element.classList.contains("wallet-connection")
          );
        },
      });

      const imageData = capturedCanvas.toDataURL("image/png");
      setCapturedImage(imageData);
      setShowModal(true);
    } catch (error) {
      console.error("Error capturing scene:", error);
    }
  };

  const handleClose = () => setShowModal(false);

  const toggleControls = () => {
    setControlsVisible(!controlsVisible);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
      }}
    >
      <NFTVerification setAccessGranted={setAccessGranted} />
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {accessGranted && showControls && (
        <PerlinControls
          usePerlin={usePerlin}
          setUsePerlin={setUsePerlin}
          amplitude={amplitude}
          setAmplitude={setAmplitude}
          scale={scale}
          setScale={setScale}
          frequency={frequency}
          setFrequency={setFrequency}
          octaves={octaves}
          setOctaves={setOctaves}
          showCaptureButton={showCaptureButton}
          captureScene={captureScene}
          controlsVisible={controlsVisible}
          isMobile={isMobile}
          fontSize={fontSize}
        />
      )}
      {/* {!accessGranted && (
        <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
          Access restricted: You need to own the NFT to control the simulation.
        </p>
      )} */}
      <Container>
        <Row>
          {controlsVisible && (
            <Button
              variant="danger"
              onClick={toggleControls}
              className="minimize-button"
              style={{
                position: "absolute",
                top: "10px",
                left: "20px",
                zIndex: 1000,
                cursor: "pointer",
                fontSize: "0.8rem",
                fontFamily: "var(--primary-font)",
                width: isMobile ? "90%" : "20%",
              }}
            >
              {controlsVisible ? "Minimize Controls" : "Show Controls"}
            </Button>
          )}
        </Row>
        <Row>
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              fontSize: "1rem",
              fontFamily: "var(--primary-font)",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 1000,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Click and drag to move the geometry!
          </div>
        </Row>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: `${fontSize}`,
            fontFamily: "var(--primary-font)",
            fontStyle: "italic",
            fontWeight: "bold",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 1000,
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            opacity: textOpacity,
            transition: "opacity 0.5s ease-in-out",
            letterSpacing: "0.05em",
          }}
        >
          {currentTextRef.current}
        </div>
      </Container>
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              color: "black",
              fontFamily: "var(--primary-font)",
              fontSize: "24px",
              fontWeight: "bold",
              fontStyle: "italic",
            }}
          >
            Mint this?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "black" }}>
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured Scene"
              style={{ width: "100%" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer
          style={{
            backgroundColor: "black",
            fontFamily: "var(--primary-font)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UploadImageWithWallet containerRef={containerRef} />
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PerlinNoise;
