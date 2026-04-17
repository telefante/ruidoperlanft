const LIGHTHOUSE_ENDPOINT = "https://node.lighthouse.storage/api/v0/add"
const MAX_JSON_SIZE = 100 * 1024

export const onRequestPost = async ({ request, env }) => {
  if (!env.LIGHTHOUSE_API_KEY) {
    console.error("LIGHTHOUSE_API_KEY env var not configured")
    return json({ error: "Server not configured" }, 500)
  }

  const contentType = request.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    return json({ error: "Expected application/json" }, 400)
  }

  const body = await request.text()
  if (body.length === 0) {
    return json({ error: "Empty body" }, 400)
  }
  if (body.length > MAX_JSON_SIZE) {
    return json({ error: "JSON too large" }, 413)
  }

  let payload
  try {
    payload = JSON.parse(body)
  } catch (err) {
    return json({ error: "Invalid JSON" }, 400)
  }

  const filename = `metadata-${Date.now()}.json`
  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  })
  const forwardForm = new FormData()
  forwardForm.append("file", blob, filename)

  let lhResponse
  try {
    lhResponse = await fetch(LIGHTHOUSE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.LIGHTHOUSE_API_KEY}`,
      },
      body: forwardForm,
    })
  } catch (err) {
    console.error("Lighthouse fetch failed:", err)
    return json({ error: "Upstream unreachable" }, 502)
  }

  if (!lhResponse.ok) {
    const detail = await lhResponse.text().catch(() => "")
    console.error("Lighthouse upload failed:", lhResponse.status, detail)
    return json({ error: "Upstream upload failed" }, 502)
  }

  const data = await lhResponse.json()
  if (!data || !data.Hash) {
    console.error("Unexpected Lighthouse response:", data)
    return json({ error: "Unexpected upstream response" }, 502)
  }

  return json({
    cid: data.Hash,
    name: data.Name,
    size: data.Size,
  })
}

export const onRequestOptions = async () =>
  new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  })

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  })
