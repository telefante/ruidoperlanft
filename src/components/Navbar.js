import React, { useState, useEffect, use } from "react";
import { Navbar, Nav, Container, Row } from "react-bootstrap";
import styled from "styled-components";
import "./navbar.css";
import WalletConnection from "./WalletConnection"; // Import WalletConnection
import { useTracking } from "../contexts/TrackingContext"
import HamburgerIcon from "./HamburgerIcon"; // Import HamburgerIcon


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
  { name: "collection", path: "collection" },
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

  const { trackEvent } = useTracking()
  const handleNavLinkClick = (sectionName) => {
    console.log("Clicked section: ", sectionName);
    trackEvent(`Section:  ${sectionName}`);
    
    setExpanded(false); // Close navbar when clicking on a link
  };


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
         
        </Navbar.Brand>
        <Row>
          <WalletConnection /> {/* Add WalletConnection here */}
          </Row>
        {/* Hamburger Toggle Icon */}
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <HamburgerIcon isOpen={expanded} toggle={() => setExpanded(!expanded)} />
        </Navbar.Toggle>

        {/* Collapsible Navbar Content */}
        <StyledNavbarCollapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {sections.map((section, index) => (
              <Nav.Link
                key={index}
                href={`#${section.path}`}
                className="nav-link-custom"
                onClick={() => handleNavLinkClick(section.name)}
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