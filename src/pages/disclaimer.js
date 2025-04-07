import React from "react"
// import Layout from "../components/layout"
import { Container, Row, Button } from "react-bootstrap"
import "../components/layout.css"; // Import global styles
const DisclaimerPage = () => {
  return (
   
      <Container style={{ padding: "2rem 0", background: "black", color: "#000" }}>
         <div className="content">
        <Row>
          <h1>Disclaimer and Legal Notice</h1>

          <h2>1. About the Project</h2>
          <p>
            <span className="highlight">“Ruido Perla NFT”</span> is an artistic and digital project that aims to
            <span className="highlight">
              generate unique digital artworks (NFTs)
            </span>{" "}
            that explore intersections between poetry, visual art, and blockchain technology. This project seeks to
            <span className="highlight">
              encourage artistic expression, digital ownership, and community engagement
            </span>.
          </p>

          <h2>2. Use of Artwork and Data</h2>
          <p>
            The digital artworks created and distributed by <span className="highlight">“Ruido Perla NFT”</span> are original creations and 
            <span className="highlight">intellectual property</span> of the artist(s). Each NFT comes with verifiable authenticity
            and ownership rights recorded on a blockchain.
          </p>
          <ul>
            <li>
              This platform <span className="highlight">does not store or manage</span> users' private blockchain keys or sensitive personal data.
            </li>
            <li>
              All blockchain transactions related to NFT minting and sales are
              <span className="highlight">transparent and public</span>.
            </li>
            <li>
              The content provided has an
              <span className="highlight">artistic and educational intent</span>, and is not intended as financial advice.
            </li>
          </ul>

          <h2>3. Third-Party Rights and Copyright</h2>
          <p>
            <span className="highlight">“Ruido Perla NFT”</span> is an independent artistic project and is
            <span className="highlight">not officially affiliated</span> with any blockchain, NFT marketplace, or external platforms unless explicitly stated.
          </p>
          <p>
            Any rights holder who believes their intellectual property rights have been infringed upon by this project
            can <span className="highlight">request content review and removal</span> by contacting:
          </p>

          <div className="contact">
            <p>
              <strong>Contact:</strong>{" "}
              <a href="mailto:luis@audiovisiones.info">
                Luis Negron van Grieken
              </a>
            </p>
          </div>

          <h2>4. Legal Responsibility and Risk</h2>
          <p>
            Participation in NFT transactions involves certain risks and is
            <span className="highlight">solely the responsibility of the user</span>. <span className="highlight">“Ruido Perla NFT”</span>
            <span className="highlight">assumes no responsibility</span> for technical issues, market fluctuations, or potential losses incurred during NFT minting, buying, or selling.
          </p>

          <h2>5. Decentralization and Accessibility</h2>
          <p>
            To ensure permanence, transparency, and resistance to censorship, artworks and associated data may be hosted using decentralized storage solutions such as
            <span className="highlight">IPFS or Arweave</span>.
          </p>
        </Row>
        <Row>
          <Button variant="danger" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Row>
        <Row className="mt-3">
          <Button variant="outline-secondary" onClick={() => window.history.back()}>
            &larr; Back
          </Button>
        </Row>
        </div>
      </Container>
    
  )
}

export default DisclaimerPage
