import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          author
          authorUrl
        }
      }
    }
  `);

  return (
    <footer
      style={{
        background: 'transparent',
        color: '#000',
        padding: '2rem 0',
        textAlign: 'center',
        zIndex: 1000,
        width: '100%',
        fontFamily: 'var(--primary-font)', // Added font family
        fontSize: '1rem', // Added font size
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <p className="mb-1" style={{ fontFamily: 'var(--primary-font)', fontSize: '1rem', color: '#000' }}>
              &copy; {new Date().getFullYear()} - Created by{' '}
              <a 
                href={data.site.siteMetadata.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {data.site.siteMetadata.author}
              </a>
            </p>
            <p className="mb-0" style={{ fontFamily: 'var(--primary-font)' }}>
              <Link to="/disclaimer" className="text-decoration-none mx-2">
                Disclaimer
              </Link>
              |
              <Link to="/privacy-policy" className="text-decoration-none mx-2">
                Privacy Policy
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;