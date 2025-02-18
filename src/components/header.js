// src/components/header.js
import React from 'react';
// import { Link } from 'gatsby';
// import BurgerMenu from "./BurgerMenu";
import CustomNavbar from "./Navbar";
// import { mintImage } from './MintImage'; // Adjust the path as necessary

const Header = ({ account, connectWallet, disconnectWallet }) => {
  return (
    <header>
  {/* <BurgerMenu/> */}
  <CustomNavbar account={account} connectWallet={connectWallet} disconnectWallet={disconnectWallet} />
    </header>
  );
};

export default Header;