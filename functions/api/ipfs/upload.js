const LIGHTHOUSE_ENDPOINT = "https://node.lighthouse.storage/api/v0/add"
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"]
const MAX_FILE_SIZE = 15 * 1024 * 1024

export const onRequestPost = async ({ request, env }) => {
  if (!env.LIGHTHOUSE_API_KEY) {
    console.error("LIGHTHOUSE_API_KEY env var not configured")
    return json({ error: "Server not configured" }, 500)
  }

  const contentType = request.headers.get("content-type") || ""
  if (!contentType.startsWith("multipart/form-data")) {
    return json({ error: "Expected multipart/form-data" }, 400)
  }

  let formData
  try {
    formData = await request.formData()
  } catch (err) {
    return json({ error: "Invalid form data" }, 400)
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return json({ error: "Missing file field" }, 400)
  }

  if (file.size === 0) {
    return json({ error: "Empty file" }, 400)
  }

  if (file.size > MAX_FILE_SIZE) {
    return json({ error: "File too large" }, 413)
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return json({ error: "Unsupported file type" }, 415)
  }

  const forwardForm = new FormData()
  forwardForm.append("file", file, file.name)

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
