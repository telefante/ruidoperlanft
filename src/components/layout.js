import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Header from "./header";
// import Seo from "./seo"; // Import SEO component
import { useEffect, useState } from "react";
import "./layout.css"; // Import global styles
import Footer from "./Footer";

// export const Head = () => (
//   <Seo
//     title="Ruido Perla NFT Collection"
//     description="Explore the Ruido Perla NFT Collection - a unique digital art series blending noise and pearl aesthetics. Discover exclusive digital collectibles created by Luis Negrón van Grieekn."
//     image="/og-image.jpg" // Ensure this image exists
//     keywords="NFT collection, digital art, Ruido Perla, Luis Negrón van Grieken, blockchain art, crypto art, pearl aesthetics, noise art, digital collectibles, unique NFTs, ethereum NFT, web3 art, contemporary digital art, generative art"
//     canonicalUrl="https://ruidoperlanft.netlify.app" // Ensure this URL is correct
//   />
//   // <Seo
// );

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
  const imageSrc = data.headerImage?.childImageSharp?.gatsbyImageData?.images?.fallback?.src;

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
      {/* SEO Component */}
      {/* <Seo
        title={seoProps?.title || data.site.siteMetadata.title}
        description={seoProps?.description || data.site.siteMetadata.description}
        image={seoProps?.image || imageSrc}
        keywords={seoProps?.keywords || data.site.siteMetadata.keywords}
      /> */}

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