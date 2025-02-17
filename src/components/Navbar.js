import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import styled from "styled-components";
import Web3 from "web3";
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
  const [account, setAccount] = useState(null);

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
        top: window.innerWidth <= 768 ? section.offsetTop - 350 : section.offsetTop - 150,
        behavior: "smooth",
      });
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      console.log("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
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
        <div className="d-flex align-items-center">
              <button onClick={account ? disconnectWallet : connectWallet} className="nav-link-custom">
                {account ? "Sync" : "Unsync"}
              </button>
              {account && (
                <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                  {account}
                </span>
              )}
            </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <StyledNavbarCollapse id="basic-navbar-nav">
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
        </StyledNavbarCollapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;