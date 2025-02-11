import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Header from "./Header";
import Seo from "./seo"; // Import SEO component
import "./layout.css"; // Import global styles
import Footer from "./footer";
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

      {/* Main Layout with Radial Gradient */}
      <div className="gradient-bg">
        {/* Header */}
        <Header siteTitle={data.site.siteMetadata?.title} />

        {/* Page Content */}
        <main className="content">{children}</main>

        {/* Footer (Optional, Uncomment if needed) */}
        <Footer />
      </div>
    </>
  );
};

export default Layout;