import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import styled from "styled-components";
import "./navbar.css";

// Add styled component for mobile nav items
const StyledNavbarCollapse = styled(Navbar.Collapse)`
  @media (max-width: 991px) {
    background: rgba(0, 0, 0);
    margin: 0 -12px;  // Compensate for container padding
    padding: 1rem;
    border-radius: 0 0 8px 8px;

    .nav-link-custom {
      padding: 0.75rem 1rem !important;
      color: white !important;
      text-align: center;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }
`;

const sections = [
  { name: "explore", path: "introduction" },
  { name: "philosophy", path: "installation" },
  { name: "assets", path: "assets" },
  { name: "simulation", path: "simulation" },
  { name: "community", path: "about" },
];

const CustomNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > 50) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
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
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        <Navbar.Brand href="#" className="brand-title">Ruido Perla NFT Collection</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <StyledNavbarCollapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {sections.map((section, index) => (
              <Nav.Link
                key={index}
                href={`#${section.path}`}
                className="nav-link-custom"
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