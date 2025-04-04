import React, { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Perlin } from "three-noise"
import { createNoise3D } from "simplex-noise"
import html2canvas from "html2canvas"
import { useStaticQuery, graphql } from "gatsby"
import { Modal, Row, Container } from "react-bootstrap"
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
  // const clockRef = useRef(new THREE.Clock())
  // const noiseVectorRef = useRef(new THREE.Vector3())
  // const perlinRef = useRef(new Perlin())
  // const simplexRef = useRef(createNoise3D())
  // const animateRef = useRef(null)
  const currentIndexRef = useRef(0)

  const [perlinSettings, setPerlinSettings] = useState({
    usePerlin: initialParams.usePerlin,
    amplitude: initialParams.amplitude,
    scale: initialParams.scale,
    frequency: initialParams.frequency,
    octaves: initialParams.octaves,
  })

  // const [verificationEnabled, setVerificationEnabled] = useState(null)

  const [textOpacity, setTextOpacity] = useState(1)
  const [capturedImage, setCapturedImage] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const cameraSetupRef = useRef({
    position: { x: 0, y: 0, z: 0 },
    lookAt: { x: 0, y: 0, z: 0 },
  })

  const cameraPositionRef = useRef(null)
  const cameraRotationRef = useRef(null)
  const controlsTargetRef = useRef(null)

  const updatePerlinSettings = (key, value) => {
    setPerlinSettings(prev => ({ ...prev, [key]: value }))
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

      geometryRef.current.attributes.position.needsUpdate = true
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
  }, [perlinSettings])

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
      const capturedCanvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: "#000000",
        scale: 1,
        logging: true,
        width: 800, // Constrain the width of the capture
        height: 600, // Constrain the height of the capture
        ignoreElements: element => {
          return (
            element.classList.contains("controls") ||
            element.id === "communication" ||
            element.id === "click-and-drag-instruction"
          )
        },
      })
      const imageData = capturedCanvas.toDataURL("image/png")
      setCurrentTextFragment(currentTextRef.current)
      setCapturedImage(imageData)
      setShowModal(true)
    } catch (error) {
      console.error("Error capturing scene:", error)
    }
  }

  const handleClose = () => setShowModal(false)

  const toggleControls = () => {
    setControlsVisible(!controlsVisible)
  }

  useEffect(() => {
    const lines = text.split("\n").filter(line => line.trim())

    const updateText = () => {
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
    const textInterval = setInterval(updateText, 5000)

    return () => {
      clearInterval(textInterval)
    }
  }, [text])

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
      {verificationEnabled && (
        <NFTVerification setAccessGranted={setAccessGranted} />
      )}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
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
        />
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
            textShadow: "2px 2px 4px rgba(47, 0, 255, 0.5)",
            opacity: textOpacity,
            transition: "opacity 0.5s ease-in-out",
            letterSpacing: "0.05em",
          }}
        >
          {currentTextRef.current}
        </div>

        <Row>
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
            Click and drag to move the geometry!
          </div>
        </Row>
      </Container>

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
                Mint this beatiful Pearl for contract:{" "}
                {process.env.GATSBY_TEZOS_REALTIME_CONTRACT}
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
