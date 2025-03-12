import React from "react";
import { motion } from "framer-motion";

const HamburgerIcon = ({ isOpen, toggle }) => {
  return (
    <button 
      onClick={toggle} 
      className="w-10 h-10 flex flex-col justify-between p-2 focus:outline-none"
    >
      <motion.div
        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
        className="bg-black h-1 w-8 rounded transition-all"
      />
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        className="bg-black h-1 w-8 rounded transition-all"
      />
      <motion.div
        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
        className="bg-black h-1 w-8 rounded transition-all"
      />
    </button>
  );
};

export default HamburgerIcon;