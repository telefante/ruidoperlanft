/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

// You can delete this file if you're not using it

import React from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./src/styles/global.css" // Custom global styles (optional)
import { TrackingProvider } from "./src/context/TrackingContext"
// import "./src/styles/beacon.css";  // ✅ Import global Beacon styles

import { WalletProvider } from "./src/components/WalletContext"

export const onInitialClientRender = () => {
  const script = document.createElement("script")
  script.src = "https://cloud.umami.is/script.js"
  script.async = true
  script.defer = true
  script.setAttribute("data-website-id", "fcb2b9c8-497b-4de9-9670-dc2b9771e5d2")
  document.body.appendChild(script)
}

export const wrapRootElement = ({ element }) => {
  return
  ;<TrackingProvider>
    <WalletProvider>{element}</WalletProvider>;
  </TrackingProvider>
}
