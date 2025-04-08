import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Header from "./header";
import { useEffect, useState } from "react";
import "./layout.css"; // Import global styles
import Footer from "./Footer";
import { Modal, Button } from "react-bootstrap";

const Layout = ({ children }) => {
  // Fetch site metadata and header image for SEO
  const data = useStaticQuery(graphql`
    query SiteTitleAndImageQuery {
      site {
        siteMetadata {
          title
          description
          keywords
        }
      }
      headerImage: file(relativePath: { eq: "og-image.jpg" }) {
        childImageSharp {
          gatsbyImageData(layout: CONSTRAINED, width: 1200)
        }
      }
    }
  `);

  const [showBrowserModal, setShowBrowserModal] = useState(false);

  useEffect(() => {
    // Function to detect Safari
    const detectSafari = () => {
      const isSafari =
        /Safari/.test(navigator.userAgent) &&
        /Apple Computer/.test(navigator.vendor);
      return isSafari;
    };

    // Check if it's Safari and show the modal
    if (detectSafari()) {
      setShowBrowserModal(true);
    }
  }, []);

  const closeModalBrowser = () => {
    setShowBrowserModal(false);
  };

  // Extract fallback image for SEO (if available)
  // const imageSrc = data.headerImage?.childImageSharp?.gatsbyImageData?.images?.fallback?.src;

  // State to control background movement
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setScrollY(window.scrollY * -0.2); // Negative to move in opposite direction
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Browser Compatibility Modal */}
      <Modal show={showBrowserModal} onHide={closeModalBrowser} centered>
        <Modal.Header closeButton>
          <Modal.Title>Browser Recommendation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          For the best experience, we recommend using Chrome, Firefox, or Opera
          to view this site. Safari may have compatibility issues.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModalBrowser}>
            Continue Anyway
          </Button>
          <Button
            variant="primary"
            href="https://www.google.com/chrome/"
            target="_blank"
          >
            Download Chrome
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Moving Background */}
      <div className="gradient-bg" style={{ transform: `translateY(${scrollY}px)` }}></div>

      {/* Main Layout */}
      <div className="content">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main>{children}</main>

        {/* Footer (Optional, Uncomment if needed) */}
        <Footer />
      </div>
    </>
  );
};

export default Layout;