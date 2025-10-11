# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ruido Perla NFT Collection** is a Gatsby-based web application that combines generative art with blockchain technology. The project creates real-time interactive 3D Perlin noise visualizations overlaid with poetic text fragments, allowing users to capture and mint unique moments as NFTs on the Tezos blockchain. The name translates to "Pearl in Noise" - finding beauty within chaos.

## Development Commands

### Development Server
```bash
# Standard development
gatsby develop

# High memory allocation (recommended for large builds)
sudo NODE_OPTIONS="--max-old-space-size=8192" DEVELOPMENT=true GATSBY_DEVELOPMENT=true gatsby develop
```
Access at `http://localhost:8000`. GraphQL explorer available at `http://localhost:8000/___graphql`.

### Build & Deployment
```bash
# Clean cache and previous builds
gatsby clean

# Production build
gatsby build

# Test production build locally
gatsby serve
```

### Code Formatting
```bash
npm run format
```
Formats all JS, JSX, TS, TSX, JSON, MD, and CSS files using Prettier.

### Deployment
The project auto-deploys to Netlify on commits to `master` branch. Manual deployment: upload `public/` directory contents after running `gatsby build`.

## Architecture Overview

### Core Technology Stack
- **Framework**: Gatsby 5.14+ (React-based static site generator)
- **3D Graphics**: Three.js with WebGL rendering for Perlin noise visualization
- **Blockchain**: Tezos using Taquito and Beacon Wallet
- **Storage**: IPFS via Lighthouse SDK
- **Styling**: Bootstrap + Styled Components
- **Animation**: Framer Motion

### Key Architectural Patterns

**1. Server-Side Rendering (SSR) Workarounds**
Many blockchain and browser-specific modules fail during Gatsby's SSR build. The project uses webpack aliasing in `gatsby-node.js` to exclude these modules during `build-html` and `develop-html` stages:

```javascript
// gatsby-node.js lines 34-52
if (stage === "build-html" || stage === "develop-html") {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "react-player": false,
        "@taquito/beacon-wallet": false,
        "@taquito/taquito": false,
        // ... additional aliases
      }
    }
  })
}
```

**Key point**: When adding new browser-only dependencies (WebSocket, crypto, Web3 libraries), add them to this alias list to prevent SSR errors.

**2. Dynamic Imports for Browser-Only Code**
Components that use blockchain functionality check for browser environment and dynamically import Tezos modules:

```javascript
// Pattern used in MintNFTProcess.js
const isBrowser = typeof window !== "undefined"

const getTezosModules = async () => {
  if (!isBrowser) return null
  const { MichelsonMap } = await import("@taquito/taquito")
  return { MichelsonMap }
}
```

**3. Wallet State Management**
Global wallet context (`WalletContext.js`) provides:
- Wallet connection/disconnection
- Tezos RPC connectivity
- Wallet address state
- Beacon wallet instance

All components requiring wallet functionality should use the `useWallet()` hook.

**4. NFT Minting Flow**
The minting process follows this sequence:
1. User adjusts Perlin noise parameters and captures screenshot via `html2canvas`
2. Image captured from canvas → Base64 data URL
3. Preview modal shows metadata with placeholder image URL
4. On confirmation: Upload image to IPFS → Get CID
5. Generate final metadata with actual image CID
6. Upload metadata to IPFS → Get metadata CID
7. Call smart contract with metadata CID and payment

**Important**: The minting flow uses tier-based pricing that changes as supply increases (src/components/MintNFTProcess.js:92-108).

### Component Architecture

**Primary Components**:
- **`PerlinNoise.js`**: Core 3D visualization using Three.js. Manages scene, camera, geometry, noise generation, text overlays, and capture functionality. Props control camera behavior, visibility, and NFT verification requirements.
- **`MintNFTProcess.js`**: Complete minting workflow including IPFS uploads, metadata generation, tier pricing calculation, and smart contract interaction.
- **`WalletContext.js` + `WalletConnection.js`**: Wallet state management and UI for connecting/disconnecting Tezos wallets.
- **`TezosNFTCarousel.js`**: Displays collection NFTs fetched from TzKT API in responsive Swiper carousel.
- **`NFTVerification.js`**: Checks if connected wallet owns collection NFTs for access-gated features.

**Section Components** (`src/components/sections/`):
The homepage is composed of modular sections that can be independently edited:
- `IntroductionSection.js` - Hero/intro
- `AboutSection.js` - Project description and artist info
- `SimulationSection.js` - Interactive Perlin noise simulation
- `InstallationSection.js` - Physical installation documentation
- `CollectionSection.js` - NFT collection display
- `AssetsSection.js` - Additional media/assets

### Data Flow

**Text Content**: Markdown files in `src/data/` are queried via GraphQL and used for animated text overlays in the Perlin noise visualization. The `PerlinNoise` component accepts a `queryFile` prop to specify which markdown file to use.

**NFT Data**: Fetched from TzKT API at runtime using contract addresses from environment variables. The API provides token metadata including attributes (Perlin parameters, text fragments, tier pricing).

**Perlin Noise Parameters**: Stored in component state and passed to Three.js rendering loop. Parameters include:
- `amplitude`: Displacement intensity (default: 12.5)
- `scale`: Noise frequency scaling (default: 0.008)
- `frequency`: Base frequency multiplier (default: 1)
- `octaves`: Number of noise layers (default: 1)
- `usePerlin`: Toggle between Perlin and Simplex noise algorithms

## Environment Configuration

All environment variables must be prefixed with `GATSBY_` to be accessible in browser code.

### Required Variables
```bash
# IPFS Storage
GATSBY_LIGHTHOUSE_API_KEY=your_lighthouse_api_key

# Tezos Configuration
GATSBY_NETWORK_TYPE=ghostnet # or mainnet
GATSBY_TEZOS_RPC_URL=https://rpc.tzkt.io/ghostnet
GATSBY_TEZOS_REALTIME_CONTRACT=KT1...  # Real-time minting contract
GATSBY_RUIDOPERLANFT_CONTRACT=KT1...   # Pre-minted collection contract
GATSBY_RPNNFT_CREATOR=tz1...           # Creator/admin wallet address

# API Endpoints
GATSBY_TZKT_API_URL=https://api.ghostnet.tzkt.io/
GATSBY_OBJKT_COLLECTION_URL=https://ghostnet.objkt.com/collections
GATSBY_OBJKT_GRAPHQL_URL=https://data.ghostnet.objkt.com/v3/graphql
```

### Smart Contract Integration

**Tier-Based Pricing**: The real-time minting contract implements dynamic pricing:
- Tier 1 (supply 0-999): 1 TEZ
- Tier 2 (supply 1000-1499): 3 TEZ
- Tier 3 (supply 1500+): 10 TEZ

**Admin Minting**: If `walletAddress === GATSBY_RPNNFT_CREATOR`, minting is free via `admin_mint` entrypoint.

**Royalties**: 10% total royalties split between minter (5%) and original creator (5%). Encoded in metadata using Tezos decimals format (500/10000 = 5%).

**Metadata Format**: Follows Tezos TZIP-21 standard with attributes array capturing Perlin parameters, text fragment, tier price, token ID, and supply info.

## Common Development Patterns

### Adding New Perlin Parameters
1. Update initial state in `PerlinNoise.js` (lines 19-25)
2. Add control in `PerlinControls.js`
3. Include in metadata attributes array in `MintNFTProcess.js:generateMetadata()`
4. Update Three.js rendering loop to use the new parameter

### Working with Three.js Scene
The scene persists across re-renders using refs (`sceneRef`, `cameraRef`, `rendererRef`, `geometryRef`). Camera position/rotation is preserved when controls are used. To modify the scene, access these refs within useEffect cleanup to avoid memory leaks.

### Modifying Minting Flow
The minting process is stateful with multiple async steps. Pay attention to:
- State updates (`uploading`, `minting`, `imageMinted`)
- Error handling at each stage (upload failures, contract errors)
- Supply checks before allowing minting
- Wallet connection verification

### Debugging SSR Issues
If you encounter "window is not defined" or similar errors during `gatsby build`:
1. Check if the problematic module is browser-only
2. Add it to the webpack alias in `gatsby-node.js` SSR block
3. For components, wrap browser code in `if (typeof window !== "undefined")` checks
4. Consider dynamic imports with `useEffect`

### Performance Considerations
- Three.js rendering runs at 60fps - optimize geometry complexity for mobile
- Large markdown files increase GraphQL query size - keep text fragments concise
- IPFS uploads can be slow - implement loading states and retry logic
- TzKT API has rate limits - implement caching for NFT collection data

## Testing Workflow

1. **Local Testing**: Use Ghostnet configuration for development. Test wallet connection, NFT verification, and minting flow without real funds.
2. **Capture Testing**: Verify `html2canvas` captures exclude control panels and UI elements using `ignoreElements` function.
3. **Contract Testing**: Admin wallet can mint for free to test without spending TEZ.
4. **IPFS Testing**: Confirm uploaded images/metadata are accessible via Lighthouse gateway URLs.

## Known Issues & Limitations

- **Memory Usage**: Large builds require increased Node.js heap size (8GB recommended)
- **SSR Compatibility**: Many Web3 libraries require browser environment - use dynamic imports
- **Camera Persistence**: Camera position resets if Perlin parameters change due to useEffect dependencies
- **Wallet Network**: Ensure wallet network matches `GATSBY_NETWORK_TYPE` (ghostnet/mainnet mismatch causes transaction failures)
- **IPFS Propagation**: Newly uploaded content may take time to propagate across IPFS network

## Project-Specific Notes

- The project originated from a physical audiovisual installation in Berlin and translates that experience into an interactive web application
- Text fragments are multilingual poetry exploring themes of emigration, displacement, and finding beauty in chaos
- NFT ownership grants access to exclusive simulation features (controlled by `verificationEnabled` prop in `PerlinNoise` component)
- The collection has a maximum supply controlled by smart contract (`max_supply` storage value)
