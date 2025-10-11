import React, { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Perlin } from "three-noise"
import { createNoise3D } from "simplex-noise"
import html2canvas from "html2canvas"
import { useStaticQuery, graphql } from "gatsby"
import { Modal, Row, Container, Button } from "react-bootstrap"
import PerlinControls from "./PerlinControls"
import { useWallet } from "./WalletContext"
import NFTVerification from "./NFTVerification"
import MintNFTProcess from "./MintNFTProcess"
import * as styles from "./PerlinNoise.module.css"
import Draggable from "react-draggable"

const PerlinNoise = ({
  // showControls = true,
  enableOrbit = true,
  initialParams = {
    amplitude: 12.5,
    scale: 0.008,
    frequency: 1,
    octaves: 1,
    usePerlin: true,
  },
  cameraParams = null,
  // showCaptureButton,
  queryFile,
  fontSize,
  controlsVisible,
  setControlsVisible,
  verificationEnabled, // Accept verificationEnabled as a prop
}) => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark {
        nodes {
          fileAbsolutePath
          rawMarkdownBody
        }
      }
    }
  `)

  const text =
    data.allMarkdownRemark.nodes.find(node =>
      node.fileAbsolutePath.includes(queryFile)
    )?.rawMarkdownBody || ""

  const mountRef = useRef(null)
  const [accessGranted, setAccessGranted] = useState(false)
  const { walletAddress, isConnected } = useWallet()
  const [currentTextFragment, setCurrentTextFragment] = useState(null)
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const currentTextRef = useRef("")
  const geometryRef = useRef(null)
  const animationFrameRef = useRef(null)
  const currentIndexRef = useRef(0)

  const [perlinSettings, setPerlinSettings] = useState({
    usePerlin: initialParams.usePerlin,
    amplitude: initialParams.amplitude,
    scale: initialParams.scale,
    frequency: initialParams.frequency,
    octaves: initialParams.octaves,
  })

  const [textOpacity, setTextOpacity] = useState(1)
  const [capturedImage, setCapturedImage] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [isAutoAnimating, setIsAutoAnimating] = useState(false) // State for auto-animation
  const [isCapturing, setIsCapturing] = useState(false) // State for capture loading

  // Progressive disclosure states
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [showExploreHint, setShowExploreHint] = useState(false)
  const [hasInteractedWithOrbit, setHasInteractedWithOrbit] = useState(false)
  const [showControlsPrompt, setShowControlsPrompt] = useState(false)

  // Accessibility states
  const [textPaused, setTextPaused] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)
  const textIntervalRef = useRef(null)

  // Detect high contrast mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      setPrefersHighContrast(highContrastQuery.matches)

      const handleChange = (e) => setPrefersHighContrast(e.matches)
      highContrastQuery.addEventListener('change', handleChange)
      return () => highContrastQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const cameraSetupRef = useRef({
    position: { x: 0, y: 0, z: 0 },
    lookAt: { x: 0, y: 0, z: 0 },
  })

  const cameraPositionRef = useRef(null)
  const cameraRotationRef = useRef(null)
  const controlsTargetRef = useRef(null)

  const updatePerlinSettings = (key, value) => {
    if (typeof value === "function") {
      // Evaluate the function to get the numeric value
      setPerlinSettings(prev => ({
        ...prev,
        [key]: value(prev[key]),
      }))
    } else {
      setPerlinSettings(prev => ({
        ...prev,
        [key]: value,
      }))
    }
  }

  useEffect(() => {
    if (!mountRef.current) return

    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

    if (cameraPositionRef.current && cameraRotationRef.current) {
      camera.position.copy(cameraPositionRef.current)
      camera.rotation.copy(cameraRotationRef.current)
    } else {
      if (cameraParams) {
        const { position, lookAt } = cameraParams
        camera.position.set(position.x, position.y, position.z)
        camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
      } else {
        camera.position.set(0, 100, 200)
        camera.lookAt(0, 0, 0)
      }
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    sceneRef.current = scene
    cameraRef.current = camera

    const planeWidth = 200
    const planeHeight = 200
    const segments = 17
    const geometry = new THREE.PlaneGeometry(
      planeWidth,
      planeHeight,
      segments,
      segments
    )
    geometryRef.current = geometry

    const solidMaterial = new THREE.MeshBasicMaterial({
      color: initialParams.colors?.solid?.color || 0x000000,
      transparent: true,
      opacity: initialParams.colors?.solid?.opacity || 0.6,
      side: THREE.DoubleSide,
    })

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: initialParams.colors?.wireframe?.color || 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: initialParams.colors?.wireframe?.opacity || 0.8,
    })

    const solidMesh = new THREE.Mesh(geometry, solidMaterial)
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial)

    scene.add(solidMesh)
    scene.add(wireframeMesh)

    const perlin = new Perlin()
    const simplex = createNoise3D()
    const noiseVector = new THREE.Vector3()
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      if (!geometryRef.current) return

      const positions = geometryRef.current.attributes.position.array
      const { amplitude, scale, frequency, octaves, usePerlin } = perlinSettings

      // Validate parameters to prevent NaN values
      if (
        isNaN(amplitude) ||
        isNaN(scale) ||
        isNaN(frequency) ||
        isNaN(octaves) ||
        amplitude <= 0 ||
        scale <= 0 ||
        frequency <= 0 ||
        octaves <= 0
      ) {
        console.error("Invalid Perlin parameters:", {
          amplitude,
          scale,
          frequency,
          octaves,
        })
        return
      }

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const y = positions[i + 1]

        let totalNoise = 0
        let amp = 1
        let freq = frequency

        for (let o = 0; o < octaves; o++) {
          if (usePerlin) {
            noiseVector.set(x * scale * freq, y * scale * freq, elapsed)
            totalNoise += perlin.get3(noiseVector) * amp
          } else {
            totalNoise +=
              simplex(x * scale * freq, y * scale * freq, elapsed) * amp
          }
          amp *= 0.5
          freq *= 2
        }

        positions[i + 2] = totalNoise * amplitude
      }

      geometryRef.current.attributes.position.needsUpdate = true // Ensure the geometry updates

      if (isAutoAnimating && cameraRef.current) {
        autoAnimateCamera(cameraRef.current, perlin, clock)
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }

    animate()

    const handleResize = () => {
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
    }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enabled = false
    controls.minDistance = 50
    controls.maxDistance = 400

    if (controlsTargetRef.current) {
      controls.target.copy(controlsTargetRef.current)
      controls.update()
    }

    const handleControlsChange = () => {
      cameraPositionRef.current = camera.position.clone()
      cameraRotationRef.current = camera.rotation.clone()
      controlsTargetRef.current = controls.target.clone()
    }

    controls.addEventListener("change", handleControlsChange)

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onPointerMove = event => {
      const rect = renderer.domElement.getBoundingClientRect()

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects([solidMesh, wireframeMesh])

      if (enableOrbit) {
        controls.enabled = intersects.length > 0
        renderer.domElement.style.cursor =
          intersects.length > 0 ? "grab" : "default"
      }
    }

    const onPointerDown = () => {
      if (controls.enabled) {
        renderer.domElement.style.cursor = "grabbing"
      }
    }

    const onPointerUp = () => {
      if (controls.enabled) {
        renderer.domElement.style.cursor = "grab"

        // Track orbit interaction for progressive disclosure
        if (!hasInteractedWithOrbit) {
          setHasInteractedWithOrbit(true)
          setShowExploreHint(false) // Hide the explore hint once user interacts
        }
      }

      cameraPositionRef.current = camera.position.clone()
      cameraRotationRef.current = camera.rotation.clone()
      controlsTargetRef.current = controls.target.clone()

      // console.log("position", camera.position)
      // const direction = new THREE.Vector3()
      // camera.getWorldDirection(direction)
      // const lookAtPoint = new THREE.Vector3()
      // lookAtPoint.addVectors(camera.position, direction.multiplyScalar(100))
      // console.log("lookAt", lookAtPoint)
    }

    renderer.domElement.addEventListener("pointermove", onPointerMove)
    renderer.domElement.addEventListener("pointerdown", onPointerDown)
    renderer.domElement.addEventListener("pointerup", onPointerUp)

    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    const lookAtPoint = new THREE.Vector3()
    lookAtPoint.addVectors(camera.position, direction.multiplyScalar(100))

    // console.log("position", camera.position)

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
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      controls.removeEventListener("change", handleControlsChange)
      controls.dispose()
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [perlinSettings, isAutoAnimating])

  // Progressive disclosure: Check if returning visitor
  useEffect(() => {
    const hasVisited = localStorage.getItem('ruidoPerla_visited')
    if (hasVisited) {
      setIsFirstVisit(false)
      setControlsVisible(true)
      setHasInteractedWithOrbit(true)
    } else {
      // First-time visitor - start progressive disclosure
      setControlsVisible(false)

      // Show "Touch to explore" hint after 20 seconds
      const hintTimer = setTimeout(() => {
        setShowExploreHint(true)
      }, 20000)

      return () => clearTimeout(hintTimer)
    }
  }, [])

  // Mark as visited when user interacts
  useEffect(() => {
    if (hasInteractedWithOrbit && isFirstVisit) {
      localStorage.setItem('ruidoPerla_visited', 'true')
      setIsFirstVisit(false)

      // Show controls prompt after orbit interaction
      setTimeout(() => {
        setShowControlsPrompt(true)
      }, 1000)
    }
  }, [hasInteractedWithOrbit, isFirstVisit])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    const handleMediaQueryChange = e => {
      setIsMobile(e.matches)
    }

    handleMediaQueryChange(mediaQuery)
    mediaQuery.addEventListener("change", handleMediaQueryChange)

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange)
    }
  }, [])

  useEffect(() => {
    if (walletAddress && isConnected) {
      console.log("🔍 Wallet connected, verifying NFT ownership...")
    } else {
      console.log("⚠️ No wallet connected, restricting access.")
      setAccessGranted(false)
    }
  }, [walletAddress, isConnected])

  const captureScene = async () => {
    if (!containerRef.current) return

    try {
      setIsCapturing(true)

      // Simulate "Capturing..." state
      await new Promise(resolve => setTimeout(resolve, 300))

      // Define the desired aspect ratio (4:3)
      const aspectRatio = 4 / 3

      // Calculate the width and height based on the container's dimensions
      let containerWidth = containerRef.current.offsetWidth
      let containerHeight = containerRef.current.offsetHeight

      // Determine whether to fit the width or height to maintain the aspect ratio
      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than the desired aspect ratio, so fit the height
        containerHeight = containerWidth / aspectRatio
      } else {
        // Container is taller than the desired aspect ratio, so fit the width
        containerWidth = containerHeight * aspectRatio
      }

      const capturedCanvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: "#000000",
        scale: 1,
        logging: true,
        // width: containerWidth, // Use calculated width
        // height: containerHeight, // Use calculated height
        ignoreElements: element => {
          return (
            element.classList.contains("controls") ||
            element.id === "communication" ||
            element.id === "click-and-drag-instruction" ||
            element.id === "auto-animation-button"
          )
        },
      })

      // "Rendering memory..." state happens during html2canvas processing

      const imageData = capturedCanvas.toDataURL("image/png")
      setCurrentTextFragment(currentTextRef.current)
      setCapturedImage(imageData)

      // Brief "Ready" state
      await new Promise(resolve => setTimeout(resolve, 200))

      setIsCapturing(false)
      setShowModal(true)
    } catch (error) {
      console.error("Error capturing scene:", error)
      setIsCapturing(false)
    }
  }

  const handleClose = () => setShowModal(false)

  const autoAnimateCamera = (
    camera,
    perlin,
    clock,
    baseRadius = 100,
    speed = 0.6
  ) => {
    const time = clock.getElapsedTime() * speed

    // Get noise values based on time
    const noiseX = perlin.get3(new THREE.Vector3(time, 0, 0)) // Use perlin.noise
    const noiseY = perlin.get3(new THREE.Vector3(0, time, 0)) // Use perlin.noise
    const noiseZ = perlin.get3(new THREE.Vector3(0, 0, time))

    // Normalize noise to range [-1, 1]
    const nx = noiseX * 2 - 1
    const ny = noiseY * 2 - 1
    const nz = noiseZ * 2 - 1

    // Calculate camera position on a circular path with noise offsets
    const radius = baseRadius + nx * 20
    const angle = time

    const x = radius * Math.cos(angle) + nx * 10
    const y = radius * Math.sin(angle) + nz * 10
    const z = 50 + ny * 20

    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
  }

  // const toggleControls = () => {
  //   setControlsVisible(!controlsVisible)
  // }

  useEffect(() => {
    const lines = text.split("\n").filter(line => line.trim())

    const updateText = () => {
      if (textPaused) return
      setTextOpacity(0)
      setTimeout(() => {
        setTextOpacity(0)
        setTimeout(() => {
          currentTextRef.current = lines[currentIndexRef.current]
          setTextOpacity(1)
          currentIndexRef.current = (currentIndexRef.current + 1) % lines.length
        }, 500)
      }, 500)
    }

    updateText()
    if (!textPaused) {
      textIntervalRef.current = setInterval(updateText, 10000)
    }

    return () => {
      if (textIntervalRef.current) {
        clearInterval(textIntervalRef.current)
      }
    }
  }, [text, textPaused])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.key.toLowerCase()) {
        case ' ': // Space - pause/resume text
          e.preventDefault()
          setTextPaused(prev => !prev)
          break
        case 'c': // C - capture scene
          if (accessGranted && controlsVisible) {
            captureScene()
          }
          break
        case 'r': // R - randomize parameters
          if (accessGranted && controlsVisible) {
            // Trigger randomize by updating parameters
            updatePerlinSettings("amplitude", prev => (prev >= 50 ? 1 : prev + 5))
            updatePerlinSettings("scale", prev => (prev >= 0.015 ? 0.001 : prev + 0.002))
            updatePerlinSettings("frequency", prev => (prev >= 5 ? 1 : prev + 0.5))
            updatePerlinSettings("octaves", prev => (prev >= 5 ? 1 : prev + 1))
          }
          break
        case '?': // ? - toggle keyboard help
          e.preventDefault()
          setShowKeyboardHelp(prev => !prev)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [accessGranted, controlsVisible, textPaused])

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Interactive Perlin noise landscape visualization"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
      }}
    >
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100%" }}
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Screen reader only content */}
      <div
        className="sr-only"
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
        aria-live="polite"
      >
        Current landscape: Wave Height {perlinSettings.amplitude.toFixed(1)},
        Grain {perlinSettings.scale.toFixed(3)},
        Rhythm {perlinSettings.frequency.toFixed(1)},
        Layers {perlinSettings.octaves}.
        {currentTextRef.current && ` Poetry fragment: ${currentTextRef.current}`}
      </div>
      {accessGranted && controlsVisible && (
        <PerlinControls
          usePerlin={perlinSettings.usePerlin}
          setUsePerlin={value => updatePerlinSettings("usePerlin", value)}
          amplitude={perlinSettings.amplitude}
          setAmplitude={value => updatePerlinSettings("amplitude", value)}
          scale={perlinSettings.scale}
          setScale={value => updatePerlinSettings("scale", value)}
          frequency={perlinSettings.frequency}
          setFrequency={value => updatePerlinSettings("frequency", value)}
          octaves={perlinSettings.octaves}
          setOctaves={value => updatePerlinSettings("octaves", value)}
          showCaptureButton={accessGranted}
          captureScene={captureScene}
          controlsVisible={controlsVisible}
          isMobile={isMobile}
          fontSize={fontSize}
          isAutoAnimating={isAutoAnimating}
          setIsAutoAnimating={setIsAutoAnimating}
          isCapturing={isCapturing}
        />
      )}
      {verificationEnabled && (
        <NFTVerification setAccessGranted={setAccessGranted} />
      )}

      <Container>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "var(--primary-color)",
            fontSize: `${fontSize}`,
            fontFamily: "var(--primary-font)",
            fontStyle: "italic",
            fontWeight: "bold",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 1000,
            textShadow: "2px 2px 4px rgba(47, 0, 255, 0.5), 0 0 20px rgba(255, 10, 180, 0.3)",
            opacity: textOpacity,
            transition: "opacity 0.5s ease-in-out",
            letterSpacing: "0.05em",
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {currentTextRef.current}
          {textPaused && (
            <span
              style={{
                display: "block",
                fontSize: "0.5rem",
                marginTop: "0.5rem",
                opacity: 0.7,
              }}
            >
              (Paused - Press Space to resume)
            </span>
          )}
        </div>

        <Row>
          {enableOrbit && !isFirstVisit && (
            <div
              style={{
                position: "absolute",
                bottom: "10%",
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
              id="click-and-drag-instruction"
            >
              Touch the landscape to explore
            </div>
          )}

          {/* Progressive disclosure: Explore hint */}
          {showExploreHint && (
            <div
              style={{
                position: "absolute",
                bottom: "15%",
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255, 10, 180, 0.9)",
                fontSize: "1.2rem",
                fontFamily: "var(--primary-font)",
                fontStyle: "italic",
                textAlign: "center",
                pointerEvents: "none",
                zIndex: 1000,
                textShadow: "2px 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(255, 10, 180, 0.5)",
                animation: "fadeIn 1s ease-in",
              }}
            >
              Touch to explore...
            </div>
          )}

          {/* Progressive disclosure: Controls prompt */}
          {showControlsPrompt && !controlsVisible && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(83, 55, 119, 0.9)",
                padding: "30px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 10, 180, 0.5)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                zIndex: 2001,
                textAlign: "center",
                fontFamily: "var(--primary-font)",
                animation: "fadeIn 0.5s ease-in",
              }}
            >
              <p style={{ color: "white", fontSize: "1.2rem", marginBottom: "20px", fontStyle: "italic" }}>
                Want to shape this landscape?
              </p>
              <Button
                onClick={() => {
                  setControlsVisible(true)
                  setShowControlsPrompt(false)
                }}
                variant="primary"
                style={{
                  fontFamily: "var(--primary-font)",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Reveal Controls
              </Button>
              <p
                onClick={() => setShowControlsPrompt(false)}
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.9rem",
                  marginTop: "15px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Maybe later
              </p>
            </div>
          )}

          {/* Keyboard shortcuts help */}
          {showKeyboardHelp && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                backgroundColor: prefersHighContrast ? "rgba(0, 0, 0, 0.95)" : "rgba(83, 55, 119, 0.95)",
                padding: "20px",
                borderRadius: "12px",
                border: `2px solid ${prefersHighContrast ? "#ffffff" : "rgba(255, 10, 180, 0.5)"}`,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                zIndex: 2002,
                fontFamily: "var(--primary-font)",
                maxWidth: "300px",
              }}
              role="dialog"
              aria-label="Keyboard shortcuts"
            >
              <h3 style={{ color: prefersHighContrast ? "#ffffff" : "white", fontSize: "1rem", marginBottom: "15px" }}>
                Keyboard Shortcuts
              </h3>
              <div style={{ color: prefersHighContrast ? "#ffffff" : "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem", lineHeight: "1.8" }}>
                <p><strong>Space</strong> - Pause/Resume text</p>
                {accessGranted && controlsVisible && (
                  <>
                    <p><strong>C</strong> - Capture scene</p>
                    <p><strong>R</strong> - Randomize parameters</p>
                  </>
                )}
                <p><strong>?</strong> - Toggle this help</p>
              </div>
              <Button
                onClick={() => setShowKeyboardHelp(false)}
                variant="outline-light"
                size="sm"
                style={{
                  marginTop: "15px",
                  fontFamily: "var(--primary-font)",
                }}
              >
                Close
              </Button>
            </div>
          )}

          {/* Keyboard help hint */}
          {!showKeyboardHelp && !isMobile && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.8rem",
                fontFamily: "var(--primary-font)",
                pointerEvents: "none",
                zIndex: 999,
              }}
            >
              Press ? for keyboard shortcuts
            </div>
          )}
        </Row>
      </Container>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div className={styles.modal}>
        <Draggable handle=".modal-header">
          <Modal
            show={showModal}
            onHide={handleClose}
            size="lg"
            style={{ cursor: "move" }}
          >
            <Modal.Header closeButton>
              <Modal.Title
                style={{
                  fontFamily: "var(--primary-font)",
                  fontWeight: "bold",
                }}
              >
                Crystallize this Pearl for contract:{" "}
                <a
                  href={`https://better-call.dev/${process.env.GATSBY_NETWORK_TYPE}/${process.env.GATSBY_TEZOS_REALTIME_CONTRACT}/tokens`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {process.env.GATSBY_TEZOS_REALTIME_CONTRACT}
                </a>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <MintNFTProcess
                containerRef={containerRef}
                capturedImage={capturedImage}
                perlinSettings={perlinSettings}
                textFragment={currentTextFragment}
              />
            </Modal.Body>
          </Modal>
        </Draggable>
      </div>
    </div>
  )
}

export default PerlinNoise
