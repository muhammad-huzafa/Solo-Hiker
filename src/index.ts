import express from "express";
import http from "http";
import dotenv from "dotenv";
import { initWebSocketServer } from "./websockets/wsServer";

// Step 1 — .env load karo
dotenv.config();

// Step 2 — Express app banao
const app = express();

// Step 3 — JSON middleware
app.use(express.json());

// Step 4 — HTTP server banao Express se
const server = http.createServer(app);

// Step 5 — WebSocket server attach karo
initWebSocketServer(server);

// Step 6 — Health check route
app.get("/", (req, res) => {
  res.send("Backend is running ");
});

// Step 7 — Port pe listen karo
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});