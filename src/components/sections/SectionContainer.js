import React, { useState, useEffect } from "react";
import "./sections.css";

const SectionContainer = ({ id, title, children, background }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    const section = document.getElementById(id);
    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, [id]);

  return (
    <section id={id} className={`section-container ${background ? "bg-light" : ""} ${isVisible ? "visible" : ""}`}>
      <div className="section-content">
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;