import React from "react";
import { WalletProvider } from "./src/components/WalletContext";
import { TrackingProvider } from "./src/contexts/TrackingContext";

export const wrapRootElement = ({ element }) => (
  <WalletProvider>
    <TrackingProvider>{element}</TrackingProvider>
  </WalletProvider>
);