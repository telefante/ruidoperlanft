import React from "react";
import "./sections.css"; // Ensure styles are defined

const SectionContainer = ({ id, title, children, background }) => {
  return (
    <section id={id} className={`section-container ${background ? "bg-light" : ""}`}>
      <div className="section-content">
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;