import React from "react"
import { Modal, Button, Tab, Nav } from "react-bootstrap"
const modalHeaderStyle = {
  fontFamily: "var(--primary-font)",
  fontStyle: "italic",
  fontSize: "1.2rem"
};

const ExplanationModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered style={modalHeaderStyle}>
      <Modal.Header closeButton>
        <Modal.Title>What is Ruido Perla?</Modal.Title>
      </Modal.Header>



      <Modal.Body>
        <Tab.Container defaultActiveKey="installation">
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="installation">Installation</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="digital">Digital Ecosystem</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="nft">What is an NFT?</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="tezos">Why Tezos?</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="installation">
              <h5>The Physical Installation</h5>
              <video
                src="//installation-loop.mp4"
                controls
                className="w-100 rounded mb-3"
              />
              <p className="text-muted">
                <em>Ruido Perla</em> began as an immersive audiovisual installation.
                Kinetic sound objects—rattles, dry pods—moved in sync with a generative simulation,
                questioning the boundary between machine, memory, and identity.
              </p>
            </Tab.Pane>

            <Tab.Pane eventKey="digital">
              <h5>From Physical to Digital</h5>
              <img
                src="/images/flow-diagram.png"
                alt="Installation to NFT flow"
                className="w-100 rounded mb-3"
              />
              <p className="text-muted">
                The digital renderings were captured from the simulation, becoming moments frozen in time.
                These transformed into NFTs — poetic, living fragments in a continuously evolving ecosystem.
              </p>
            </Tab.Pane>

            <Tab.Pane eventKey="nft">
              <h5>What is an NFT?</h5>
              <p className="text-muted">
                An NFT is a unique digital object stored on the blockchain.
                It acts as proof of authenticity and ownership. In <em>Ruido Perla</em>,
                each NFT is a token of memory — both collectible and interactive.
              </p>
            </Tab.Pane>

            <Tab.Pane eventKey="tezos">
              <h5>Why Tezos?</h5>
              <p className="text-muted">
                We chose Tezos for its eco-conscious protocol, low transaction costs,
                and strong artistic community. It allows us to mint works sustainably,
                keeping the creative process aligned with environmental values.
              </p>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ExplanationModal