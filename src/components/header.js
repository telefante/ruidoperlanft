// src/components/header.js
import React from 'react';
// import { Link } from 'gatsby';
// import BurgerMenu from "./BurgerMenu";
import CustomNavbar from "./Navbar";

const Header = () => {
  return (
    <header>
  {/* <BurgerMenu/> */}
  <CustomNavbar/>
    </header>
  );
};

export default Header;