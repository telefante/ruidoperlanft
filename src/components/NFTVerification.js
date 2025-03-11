import React, { useState, useEffect } from "react"
import { request, gql } from "graphql-request"
import { useWallet } from "./WalletContext"
import { Container, Row} from "react-bootstrap"

const objktapi =
  process.env.GATSBY_OBJKT_GRAPHQL_URL ||
  "https://data.ghostnet.objkt.com/v3/graphql"
const contractAddress =
  process.env.GATSBY_TEZOS_CONTRACT
const CACHE_KEY = "nftOwnershipCache"
const CACHE_EXPIRY = 5 * 60 * 1000 // Cache for 5 minutes

const NFTVerification = ({ setAccessGranted }) => {
  const { walletAddress, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("🟡 useEffect triggered in NFTVerification.")
    console.log("📌 Wallet Address:", walletAddress)
    console.log("📌 Wallet Connected:", isConnected)

    if (!walletAddress || !isConnected) {
      console.log("❌ No wallet connected. Denying access.")
      setAccessGranted(false)
      return
    }

    verifyOwnership(walletAddress)
  }, [walletAddress, isConnected, setAccessGranted])

  const verifyOwnership = async address => {
    console.log("🟡 Verifying NFT ownership for wallet:", address)
    setLoading(true)
    const cachedData = getCachedOwnership(address)

    if (cachedData !== null) {
      console.log("✅ Using cached NFT verification:", cachedData)
      setAccessGranted(cachedData)
      setSuccess(cachedData)
      setLoading(false)
      return
    }

    try {
      console.log("📡 Checking TzKT API...")
      const ownsNFT = await checkNFTOwnershipTzKT(address)
      console.log("🔍 TzKT API Result:", ownsNFT)

      if (ownsNFT) {
        cacheOwnership(address, true)
        setAccessGranted(true)
        setSuccess(true)
        setLoading(false)
        return
      }

      console.log("📡 Checking Objkt API...")
      const ownsNFTObjkt = await checkNFTOwnershipObjkt(address)
      console.log("🔍 Objkt API Result:", ownsNFTObjkt)

      if (ownsNFTObjkt) {
        cacheOwnership(address, true)
        setAccessGranted(true)
        setSuccess(true)
        setLoading(false)
        return
      }

      console.log("❌ No NFTs found in either API.")
      cacheOwnership(address, false)
      setAccessGranted(false)
      setError("You do not own an NFT from this collection.")
    } catch (err) {
      console.error("⚠️ Error verifying NFT ownership:", err)
      setError("Failed to verify NFT ownership.")
    }
    setLoading(false)
  }

  // Check local storage cache
  const getCachedOwnership = address => {
    const cache = localStorage.getItem(CACHE_KEY)
    if (cache) {
      const parsedCache = JSON.parse(cache)
      const cachedEntry = parsedCache[address]

      if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRY) {
        return cachedEntry.ownsNFT // Return cached result if not expired
      }
    }
    return null // Cache expired or not found
  }

  // Store result in cache
  const cacheOwnership = (address, ownsNFT) => {
    const cache = localStorage.getItem(CACHE_KEY)
    const parsedCache = cache ? JSON.parse(cache) : {}

    parsedCache[address] = {
      ownsNFT,
      timestamp: Date.now(),
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(parsedCache))
  }

  // Primary check: TzKT API (checks ANY NFT in collection)
  const checkNFTOwnershipTzKT = async address => {
    const apiUrl = `https://ghostnet.tzkt.io/v1/tokens/balances?account=${address}&token.contract=${contractAddress}`
    console.log("TzKT API Request:", apiUrl) // Log the API request
    try {
      const response = await fetch(apiUrl)
      const data = await response.json()
      console.log("TzKT API Response:", data) // Log the API response
      return data.length > 0 // If there's any entry, the user owns at least one NFT
    } catch (error) {
      console.error("TzKT API Error:", error)
      return false
    }
  }

  // Fallback check: Objkt.com GraphQL API
  const checkNFTOwnershipObjkt = async address => {
    const query = gql`
      query {
        token_holder(
          where: {
            holder_address: { _eq: "${address}" }
            token: { fa_contract: { _eq: "${contractAddress}" } }
          }
        ) {
          quantity
        }
      }
    `
    // console.log("Objkt API Request:", query)
    try {
      const data = await request(objktapi, query)
      console.log("Objkt API Response:", data)

      // Sum all the `quantity` values to get the total NFT count
      const totalNFTsOwned = data.token_holder.reduce(
        (sum, holder) => sum + holder.quantity,
        0
      )

      return totalNFTsOwned > 0 // Return true if at least 1 NFT is owned
    } catch (error) {
      console.error("Objkt API Error:", error)
      return false
    }
  }

  return (
    <div>
      {loading && <p>Checking NFT ownership...</p>}
      {success && (
        <Container>
        <Row>
          <h3> Congratulations! you are a collector of Ruido Perla</h3>
         
        </Row>
        </Container>
      )}
      {!success && (
        <Container>
          <Row>
            <h3>become a collector of Ruido Perla to play with the simulation.</h3>
          </Row>
        </Container>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}

export default NFTVerification
