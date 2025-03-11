import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import styled from "styled-components";
import "./navbar.css";
import WalletConnection from "./WalletConnection"; // Import WalletConnection


// Styled component for mobile-friendly navbar collapse
const StyledNavbarCollapse = styled(Navbar.Collapse)`
  @media (max-width: 720px) {
    background: rgba(0, 0, 0, 0.9);
    padding: 1rem;
    border-radius: 0 0 8px 8px;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .nav-link-custom {
      padding: 0.75rem 1rem !important;
      color: #eee !important;
      transition: background-color 0.3s ease, color 0.3s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff !important;
      }
    }
  }
`;

const sections = [
  { name: "hello", path: "introduction" },
  { name: "collection", path: "tezos-nft-carousel" },
  { name: "poetry", path: "simulation" },
  { name: "whitepaper", path: "installation" },
  { name: "installation", path: "about" },
];

const CustomNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Navbar 
      expand="lg"
      className={`custom-navbar fixed-top ${scrolled ? "scrolled" : ""}`}
      collapseOnSelect
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Brand Title */}
        <Navbar.Brand href="#" className="brand-title" >
          Ruido Perla NFT Collection
          <WalletConnection /> {/* Add WalletConnection here */}
        </Navbar.Brand>

        {/* Hamburger Toggle Icon */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Collapsible Navbar Content */}
        <StyledNavbarCollapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {sections.map((section, index) => (
              <Nav.Link
                key={index}
                href={`#${section.path}`}
                className="nav-link-custom"
                onClick={() => setExpanded(false)} // Close navbar when clicking on a link
              >
                {section.name}
              </Nav.Link>
            ))}
           
          </Nav>
        </StyledNavbarCollapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;