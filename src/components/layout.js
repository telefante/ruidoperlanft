import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Header from "./header";
import { useEffect, useState } from "react";
import "./layout.css"; // Import global styles
import Footer from "./Footer";


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