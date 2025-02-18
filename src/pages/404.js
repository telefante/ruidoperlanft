import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"

const NotFoundPage = () => {
  // Check if running in the browser
  const isBrowser = typeof window !== "undefined";

  return (
    <Layout>
      <h1>404: Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      {/* You can add browser-specific code here if needed */}
      {isBrowser && <p>This is only visible in the browser.</p>}
    </Layout>
  );
}

export const Head = () => <Seo title="404: Not Found" />

export default NotFoundPage
