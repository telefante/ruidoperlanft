import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Header from "./Header";
import Seo from "./seo"; // Import SEO component
// import Footer from "./Footer"; 
// Import Footer component
import "./layout.css";

const Layout = ({ children, seoProps }) => {
  // Fetch site metadata and header image for SEO
  const data = useStaticQuery(graphql`
    query SiteTitleAndImageQuery {
      site {
        siteMetadata {
          title
          description
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

  return (
    <>
      {/* SEO Component */}
      <Seo
        title={seoProps?.title || data.site.siteMetadata.title}
        description={seoProps?.description || data.site.siteMetadata.description}
        image={seoProps?.image || imageSrc}
        keywords={seoProps?.keywords || "art, NFT, digital, Collection"}
      />

      {/* Header */}
      <Header siteTitle={data.site.siteMetadata?.title} />

      {/* Main Layout */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
        }}
      >
        <main style={{ flex: 1 }}>{children}</main>
        
        {/* Footer */}
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Layout;