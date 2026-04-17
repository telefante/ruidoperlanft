# Ruido Perla NFT

> Pearl in Noise — finding beauty within chaos.

An interactive generative art experience built on Gatsby + Three.js, paired with a real-time minting flow on Tezos. Users shape a 3D Perlin-noise landscape overlaid with multilingual poetry, capture a moment of it, and mint that moment as an NFT. The project originated from a physical audiovisual installation in Berlin.

## Stack

- **Frontend** — Gatsby 5, React 18, Three.js, Framer Motion, Bootstrap + Styled Components
- **Blockchain** — Tezos via Taquito and Beacon Wallet
- **Storage** — IPFS via Lighthouse, fronted by a Cloudflare Pages Function so the API key never reaches the browser
- **Hosting** — Cloudflare Pages (Functions + static Gatsby output)

## Quick start

```bash
npm install
gatsby develop
```

Open http://localhost:8000. The IPFS upload endpoints are **not** served by `gatsby develop` — use the Wrangler workflow below to exercise the minting flow end-to-end.

### Running with Pages Functions locally

```bash
echo "LIGHTHOUSE_API_KEY=<your-dev-key>" > .dev.vars
gatsby build
npx wrangler pages dev public --compatibility-flag=nodejs_compat
```

Wrangler serves `public/` and mounts the functions at `/api/ipfs/upload` and `/api/ipfs/upload-json`.

### Scripts

| Command | Purpose |
| --- | --- |
| `gatsby develop` | Dev server (no Functions) |
| `gatsby build` | Production build → `public/` |
| `gatsby serve` | Preview built output |
| `gatsby clean` | Wipe `.cache/` and `public/` |
| `npm run format` | Prettier across JS/JSX/TS/TSX/JSON/MD/CSS |

## Project layout

```
.
├── functions/api/ipfs/       Cloudflare Pages Functions (IPFS proxy)
│   ├── upload.js             POST multipart → Lighthouse, returns { cid }
│   └── upload-json.js        POST JSON → Lighthouse, returns { cid }
├── src/
│   ├── components/
│   │   ├── PerlinNoise.js    Three.js scene + capture
│   │   ├── MintNFTProcess.js Upload + mint orchestration
│   │   ├── WalletContext.js  Beacon wallet state
│   │   └── sections/         Homepage section components
│   ├── data/                 Markdown text fragments (GraphQL)
│   └── pages/                Gatsby routes
├── gatsby-node.js            SSR webpack aliasing for browser-only deps
├── wrangler.toml             Cloudflare Pages config
└── .nvmrc                    Node 20
```

## Environment variables

### Public — inlined into the client bundle

These are already public on-chain or are public URLs; the `GATSBY_` prefix is correct:

```
GATSBY_NETWORK_TYPE
GATSBY_TEZOS_RPC_URL
GATSBY_TEZOS_RPC_URL_BACKUP
GATSBY_TEZOS_REALTIME_CONTRACT
GATSBY_RUIDOPERLANFT_CONTRACT
GATSBY_RPNNFT_CREATOR
GATSBY_API_VERSION
GATSBY_TZKT_API_URL
GATSBY_OBJKT_COLLECTION_URL
GATSBY_OBJKT_TOKEN_URL
GATSBY_OBJKT_GRAPHQL_URL
```

### Secret — server-only

Only available inside Pages Functions as `env.LIGHTHOUSE_API_KEY`. No `GATSBY_` prefix, otherwise Gatsby would inline it.

```
LIGHTHOUSE_API_KEY
```

## Deployment (Cloudflare Pages)

1. Create a Pages project, connect the repo, branch `master`.
2. Build settings:
   - Build command: `gatsby build`
   - Build output directory: `public`
   - Node version: `20`
3. Environment variables (dashboard → *Settings → Environment variables*):
   - Add every public `GATSBY_*` for both Production and Preview (plain text).
   - Add `LIGHTHOUSE_API_KEY` as an **encrypted** secret.
4. Deploy. Verify the proxy with:
   ```bash
   curl -i https://<project>.pages.dev/api/ipfs/upload -X OPTIONS
   ```

### Security note

Before the migration to Cloudflare, the Lighthouse API key was inlined into the client bundle as `GATSBY_LIGHTHOUSE_API_KEY`. Treat that key as compromised and rotate it after your first successful Cloudflare deploy. Only the new key, stored as `LIGHTHOUSE_API_KEY`, should exist going forward.

### Roadmap for the proxy

- Wallet-signature gating (verify a Tezos signature header before forwarding)
- Per-wallet/IP rate limiting via Cloudflare rules
- Contract supply check server-side (block uploads once `max_supply` reached)

## Minting flow

1. User tweaks Perlin parameters in the UI.
2. `html2canvas` captures the Three.js scene as a PNG data URL.
3. Metadata preview modal opens (token name, attributes, tier price).
4. On confirm:
   - `POST /api/ipfs/upload` (multipart PNG) → `{ cid }`
   - Final metadata JSON is generated with the image CID.
   - `POST /api/ipfs/upload-json` → `{ cid }`
   - Smart contract `mint` (or `admin_mint` for the creator wallet) called with the metadata CID and tier price.

Tier pricing is dynamic based on current supply — see `src/components/MintNFTProcess.js:92-108`.

## License

0BSD. See `LICENSE`.
