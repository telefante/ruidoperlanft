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
      alias: {
        crypto: require.resolve("crypto-browserify"),
      },
    },
    
    plugins: [
      new (require("webpack")).ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),
    ],
  });

  // Exclude browser-only modules from SSR to fix "window is not defined" error
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          "react-player": false,
          "@taquito/beacon-wallet": false,
          "@taquito/taquito": false,
          "node-fetch": false,
          "whatwg-url": false,
          "tr46": false,
          "ws": false,
          "stream": false,
          "@stablelib/x25519": false,
        },
      },
    });
  }
};