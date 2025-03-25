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
  // Set up fallbacks for Node.js modules
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser"),
      },
    },
  });

  // Exclude browser-only modules from SSR to fix "window is not defined" error
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
          "@taquito/taquito": false,  // Exclude TezosToolkit during SSR
          "ethers": false,  // Exclude ethers during SSR
          "web3": false,  // Exclude web3 during SSR
          "@ethersproject/abi": false,  // Exclude ethers ABI during SSR
          "@ethersproject/providers": false,  // Exclude ethers providers during SSR
          "@ethersproject/contracts": false,  // Exclude ethers contracts during SSR
          "react-fast-compare": false,  // Exclude react-fast-compare during SSR
          "framer-motion": false,  // Exclude framer-motion during SSR
          "@taquito/beacon-wallet": false,  // Exclude beacon wallet during SSR
          "@taquito/utils": false,  // Exclude taquito utils during SSR
          "@taquito/michelson-encoder": false,  // Exclude taquito encoder during SSR
          "@taquito/michel-codec": false,  // Exclude taquito codec during SSR
          "@taquito/local-forging": false,  // Exclude taquito forging during SSR
          "@taquito/http-utils": false,  // Exclude taquito http utils during SSR
        },
      },
    });
  }
};