// src/components/seo.js
import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";

export function Seo({ title, description, image, keywords, canonicalUrl }) {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          keywords
          siteUrl
        }
      }
    }
  `);

  const defaultTitle = site.siteMetadata.title || "Ruido Perla NFT Collection";
  const defaultDescription = site.siteMetadata.description || "Explore the Ruido Perla NFT Collection - a unique digital art series blending noise and pearl aesthetics.";
  const defaultKeywords = site.siteMetadata.keywords || "NFT, digital art, web3, crypto art, Luis Negrón";
  const siteUrl = site.siteMetadata.siteUrl;
  const defaultImage = `${siteUrl}/og-image.jpg`;

  return (
    <>
      <title>{title || defaultTitle}</title>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* SEO Basic */}
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={canonicalUrl || siteUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={defaultImage} />
    </>
  );
}

export default Seo;
