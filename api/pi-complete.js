export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST.",
      endpoint: "/api/pi-complete"
    });
  }

  try {
    const { paymentId, txid } = req.body || {};

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Missing paymentId"
      });
    }

    if (!txid) {
      return res.status(400).json({
        success: false,
        error: "Missing txid"
      });
    }

    const apiKey = process.env.PI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "PI_API_KEY missing in Vercel environment"
      });
    }

    console.log("[pi-complete] Received paymentId:", paymentId);
    console.log("[pi-complete] Received txid:", txid);
    console.log("[pi-complete] Has API key:", !!apiKey);
    console.log("[pi-complete] API key length:", apiKey.length);
    console.log("[pi-complete] Calling Pi API complete");

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ txid }),
        signal: AbortSignal.timeout(8000)
      }
    );

    const text = await response.text();

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    console.log("[pi-complete] Pi API status:", response.status);
    console.log("[pi-complete] Pi API body:", body);

    return res.status(response.ok ? 200 : response.status).json({
      success: response.ok,
      endpoint: "/api/pi-complete",
      paymentId,
      txid,
      piStatus: response.status,
      body
    });
  } catch (error) {
    console.error("[pi-complete] Error:", error);

    return res.status(500).json({
      success: false,
      endpoint: "/api/pi-complete",
      error: error.message || "Unknown complete error"
    });
  }
}
