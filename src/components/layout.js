import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Header from "./header";
import Seo from "./seo"; // Import SEO component
import { useEffect, useState } from "react";
import "./layout.css"; // Import global styles
import Footer from "./Footer";
import Web3 from "web3"; // Import Web3

const Layout = ({ children, seoProps }) => {
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
  const imageSrc = data.headerImage?.childImageSharp?.gatsbyImageData?.images?.fallback?.src;

  // State to control background movement
  const [scrollY, setScrollY] = useState(0);
  const [account, setAccount] = useState(null); // State to store wallet account

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY * -0.2); // Negative to move in opposite direction
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]); // Set the first account
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
    <>
      {/* SEO Component */}
      <Seo
        title={seoProps?.title || data.site.siteMetadata.title}
        description={seoProps?.description || data.site.siteMetadata.description}
        image={seoProps?.image || imageSrc}
        keywords={seoProps?.keywords || data.site.siteMetadata.keywords}
      />

      {/* Moving Background */}
      <div className="gradient-bg" style={{ transform: `translateY(${scrollY}px)` }}></div>

      {/* Main Layout */}
      <div className="content">
        {/* Header */}
        <Header account={account} connectWallet={connectWallet} disconnectWallet={disconnectWallet} />

        {/* Page Content */}
        <main>{children}</main>

        {/* Footer (Optional, Uncomment if needed) */}
        <Footer />
      </div>
    </>
  );
};

export default Layout;