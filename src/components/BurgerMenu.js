import React, { useState } from "react";
import { slide as Menu } from "react-burger-menu";
import "./menu.css"; // Custom styles

const sections = [
  { name: "Installation", path: "#installation" },
  { name: "Simulation", path: "#simulation" },
  { name: "Assets", path: "#assets" },
  { name: "About", path: "#about" },
];

const BurgerMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  return (
    <Menu right isOpen={menuOpen} onStateChange={handleStateChange}>
      {sections.map((section, index) => (
        <a key={index} href={section.path} className="menu-item" onClick={() => setMenuOpen(false)}>
          {section.name}
        </a>
      ))}
    </Menu>
  );
};

export default BurgerMenu;
