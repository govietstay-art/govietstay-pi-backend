export default function handler(req, res) {
  const hasPiApiKey = !!process.env.PI_API_KEY;
  const apiKeyLength = process.env.PI_API_KEY
    ? process.env.PI_API_KEY.length
    : 0;

  res.status(200).json({
    status: "ok",
    app: "GoVietStay",
    environment: "sandbox",
    message: "GoVietStay Pi backend is running",
    hasPiApiKey,
    apiKeyLength,
    endpoints: {
      health: "/api/pi-health",
      approve: "/api/pi-approve",
      complete: "/api/pi-complete"
    }
  });
}
