import React, { createContext, useContext } from "react";
import { useStaticQuery, graphql } from "gatsby";

// Create a context
const ContractContext = createContext();

// Create a provider component
export const ContractProvider = ({ children }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          contractNumber
        }
      }
    }
  `);

  const contractAddress = data.site.siteMetadata.contractNumber;

  return (
    <ContractContext.Provider value={contractAddress}>
      {children}
    </ContractContext.Provider>
  );
};

// Create a custom hook to use the contract address
export const useContractAddress = () => {
  return useContext(ContractContext);
}; 