"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const wsServer_1 = require("./websockets/wsServer");
// Step 1 — .env load karo
dotenv_1.default.config();
// Step 2 — Express app banao
const app = (0, express_1.default)();
// Step 3 — JSON middleware
app.use(express_1.default.json());
// Step 4 — HTTP server banao Express se
const server = http_1.default.createServer(app);
// Step 5 — WebSocket server attach karo
(0, wsServer_1.initWebSocketServer)(server);
// Step 6 — Health check route
app.get("/", (req, res) => {
    res.send("Backend is running ");
});
// Step 7 — Port pe listen karo
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
