import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import "./navbar.css";

const sections = [
  { name: "explore", path: "simulation" },
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
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (expanded) {
      document.body.style.paddingTop = '320px';
    } else {
      document.body.style.paddingTop = '76px';
    }
  }, [expanded]);

  const handleScrollToSection = (event, sectionId) => {
    event.preventDefault();
    setExpanded(false);
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 150,
        behavior: "smooth",
      });
    }
  };

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