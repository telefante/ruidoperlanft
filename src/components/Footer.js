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
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <p className="mb-1">
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
            <p className="mb-0">
              <Link to="/disclaimer" className="text-decoration-none mx-2">
                Aviso legal / Disclaimer
              </Link>
              |
              {/* <Link to="/privacy-policy" className="text-decoration-none mx-2">
                Privacy Policy
              </Link> */}
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;