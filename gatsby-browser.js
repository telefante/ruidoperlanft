/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

// You can delete this file if you're not using it

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./src/styles/global.css"; // Custom global styles (optional)
// import "./src/styles/beacon.css";  // ✅ Import global Beacon styles

import { WalletProvider } from "./src/components/WalletContext";

export const wrapRootElement = ({ element }) => {
  return <WalletProvider>{element}</WalletProvider>;
};
