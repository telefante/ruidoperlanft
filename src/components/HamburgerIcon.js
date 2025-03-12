import React from "react";
import { motion } from "framer-motion";

const HamburgerIcon = ({ isOpen, toggle }) => {
  return (
    <button 
      onClick={toggle} 
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "40px",
        height: "32px",
        padding: "4px",
        border: "none",
        background: "transparent",
        cursor: "pointer"
      }}
    >
      {/* Top Line */}
      <motion.div
        initial={{ rotate: 0, y: 0 }}
        animate={isOpen ? { rotate: 45, y: 12 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3,   type: "spring",
            stiffness: 200,
            damping: 10,
            mass: 1,
            bounce: 0.5 }}
        style={{ backgroundColor: "white", height: "4px", width: "32px", borderRadius: "4px" }}
      />
      
      {/* Middle Line (disappears when open) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ backgroundColor: "white", height: "4px", width: "18px", borderRadius: "4px" }}
      />
      
      {/* Bottom Line */}
      <motion.div
        initial={{ rotate: 0, y: 0 }}
        animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, type: "spring",
            stiffness: 200,
            damping: 10,
            mass: 1,
            bounce: 0.5}}
        style={{ backgroundColor: "white", height: "4px", width: "32px", borderRadius: "4px" }}
      />
    </button>
  );
};

export default HamburgerIcon;