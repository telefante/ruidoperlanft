import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import "./navbar.css"; // Custom styles

const sections = [
  { name: "Installation", path: "#installation" },
  { name: "Simulation", path: "#simulation" },
  { name: "Assets", path: "#assets" },
  { name: "About", path: "#about" },
];

const CustomNavbar = () => {
  return (
    <Navbar expand="lg" className="custom-navbar fixed-top">
      <Container>
        <Navbar.Brand href="#" className="brand-title">My Gatsby Site</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {sections.map((section, index) => (
              <Nav.Link key={index} href={section.path} className="nav-link-custom">
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