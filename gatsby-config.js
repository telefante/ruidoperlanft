/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Ruido Perla NFT Collection`,
    description: `Explore the Ruido Perla NFT Collection - a unique digital art series blending noise and pearl aesthetics. Discover exclusive digital collectibles created by Luis Negrón van Grieekn.`,
    keywords: `NFT collection, digital art, Ruido Perla, Luis Negrón van Grieekn, blockchain art, crypto art, pearl aesthetics, noise art, digital collectibles, unique NFTs, ethereum NFT, web3 art, contemporary digital art, generative art`, // SEO optimized keywords
    author: 'Luis Negrón van Grieekn',
    authorUrl: 'https://luis.negronvangrieken.com',
    siteUrl: `https://ruidoperlanft.netlify.app`,
    contractNumber: "KT1VsqcpRfzzPCqPiwLXsFKh6BCpEfsJt2yR", // Add your contract number for RuiPerla
  },
  plugins: [
    `gatsby-plugin-postcss`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/static/images/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `video`,
        path: `${__dirname}/src/assets/video/`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Ruido Perla NFT Collection`,
        short_name: `Ruido Perla`,
        start_url: `/`,
        background_color: `#e1f7f5`, // Using light blue from global.css
        theme_color: `#533777`, // Using purple from global.css
        display: `standalone`, // Changed to standalone for better PWA experience
        icon: `static/images/favicon.png`, // Updated path to match source filesystem
        icons: [
          {
            src: `static/images/favicon-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
            purpose: `any maskable`
          },
          {
            src: `static/images/favicon-512x512.png`, 
            sizes: `512x512`,
            type: `image/png`,
            purpose: `any maskable`
          }
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data`,
      },
    },
    `gatsby-transformer-remark`,
  ],
}
