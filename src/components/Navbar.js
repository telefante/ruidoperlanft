import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";

const sections = [
  { name: "Installation", path: "installation" },
  { name: "Simulation", path: "simulation" },
  { name: "Assets", path: "assets" },
  { name: "About", path: "about" },
];

const CustomNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

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

  const handleScrollToSection = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 150, // Adjust offset if needed
        behavior: "smooth",
      });
    }
  };

  return (
    <Navbar expand="lg" className={`custom-navbar fixed-top ${scrolled ? "scrolled" : ""}`}>
      <Container>
        <Navbar.Brand href="#" className="brand-title">Ruido Perla NFT Collection</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {sections.map((section, index) => (
              <Nav.Link
                key={index}
                href={`#${section.path}`}
                onClick={(e) => handleScrollToSection(e, section.path)}
                className="nav-link-custom"
              >
                {section.name}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;