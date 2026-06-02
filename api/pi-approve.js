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
      endpoint: "/api/pi-approve"
    });
  }

  try {
    const { paymentId } = req.body || {};

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Missing paymentId"
      });
    }

    const apiKey = process.env.PI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "PI_API_KEY missing in Vercel environment"
      });
    }

    console.log("[pi-approve] Received paymentId:", paymentId);
    console.log("[pi-approve] Has API key:", !!apiKey);
    console.log("[pi-approve] API key length:", apiKey.length);
    console.log("[pi-approve] Calling Pi API approve");

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json"
        },
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

    console.log("[pi-approve] Pi API status:", response.status);
    console.log("[pi-approve] Pi API body:", body);

    return res.status(response.ok ? 200 : response.status).json({
      success: response.ok,
      endpoint: "/api/pi-approve",
      paymentId,
      piStatus: response.status,
      body
    });
  } catch (error) {
    console.error("[pi-approve] Error:", error);

    return res.status(500).json({
      success: false,
      endpoint: "/api/pi-approve",
      error: error.message || "Unknown approve error"
    });
  }
}
