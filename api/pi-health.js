export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    app: "GoVietStay",
    environment: "sandbox",
    message: "GoVietStay Pi backend is running"
  });
}
