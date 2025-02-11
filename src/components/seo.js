import React from "react";
import { Helmet } from "react-helmet";
import { useStaticQuery, graphql } from "gatsby";

const Seo = ({ title, description, image, keywords, canonicalUrl }) => {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `);

  const defaultTitle = "CNE: ¿Dónde está mi acta?";
  const defaultDescription =
    "“¿Dónde está mi acta?” es una plataforma que denuncia la falta de transparencia en las elecciones de Venezuela 2024.";
  const defaultImage = `${site.siteMetadata.siteUrl}/og-image.jpg`; // Ensure this image exists
  const defaultKeywords =
    "¿Dónde está mi acta?, cne, venezuela, transparencia electoral, elecciones 2024";
  const siteUrl = site.siteMetadata.siteUrl;

  return (
    <Helmet>
      {/* ✅ Force Open Graph Tags to Be at the Top */}
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* ✅ Open Graph Meta Tags */}
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:type" content="website" />

      {/* ✅ Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* ✅ Basic SEO Meta Tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={canonicalUrl || siteUrl} />
    </Helmet>
  );
};

export default Seo;