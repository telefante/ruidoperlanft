/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */

import React from "react";

export const onRenderBody = ({ setHeadComponents }) => {
  setHtmlAttributes({ lang: `en` })
  setHeadComponents([
    <link
      key="adobe-fonts"
      rel="stylesheet"
      href="https://use.typekit.net/crd1sua.css"
    />,
  ]);
};
