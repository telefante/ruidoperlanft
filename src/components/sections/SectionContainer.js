import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import "./sections.css";

const SectionContainer = ({ id, title, children, background, isGridLayout }) => {
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
    <section id={id} className={`section-container ${background ? "bg-light" : ""} ${isVisible ? "visible" : ""} mb-5`}>
      <Container>
        {!isGridLayout && title && <h2>{title}</h2>}
        {children}
      </Container>
    </section>
  );
};

export default SectionContainer;