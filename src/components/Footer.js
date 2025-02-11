import React from 'react';
import { Link } from 'gatsby';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#ffffff',
        color: '#fff',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <p>&copy;  {new Date().getFullYear()}</p>
      <p>
        <Link to="/disclaimer">Aviso legal / Disclaimer </Link> |{' '}
        {/* <Link to="/privacy-policy">Privacy Policy</Link> */}
      </p>
    </footer>
  );
};

export default Footer;