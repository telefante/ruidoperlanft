exports.createPages = async ({ actions }) => {
  const { createPage } = actions;
  createPage({
    path: "/using-dsg",
    component: require.resolve("./src/templates/using-dsg.js"),
    context: {},
    defer: true,
  });
};

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser"),
      },
    },
    plugins: [
      new (require("webpack")).ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),
    ],
  });

  // ✅ Exclude browser-only modules from SSR to fix "window is not defined" error
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          "react-player": false,
          "@taquito/beacon-wallet": false,
          "node-fetch": false,
          "whatwg-url": false,  // Prevents SSR error with URL handling
          "tr46": false,        // Prevents issue with encoding
          "ws": false,  // WebSocket library is for browser use only
          "stream": false,  // Prevents "stream" module error
          "@stablelib/x25519": false,  // Exclude the cryptographic library causing issues
        },
      },
    });
  }
};