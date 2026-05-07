"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocketServer = initWebSocketServer;
const ws_1 = require("ws");
const wsClients_1 = require("./wsClients");
const chatHandler_1 = require("../handlers/chatHandler");
const presenceHandler_1 = require("../handlers/presenceHandler");
const readHandler_1 = require("../handlers/readHandler");
function initWebSocketServer(server) {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on("connection", (ws, req) => {
        // Step 1 — URL se userId nikalo
        const url = new URL(req.url, `http://localhost`);
        const userId = url.searchParams.get("userId");
        // Step 2 — userId nahi hai toh connection close karo
        if (!userId) {
            ws.close();
            return;
        }
        // Step 3 — Client ko Map mein store karo
        wsClients_1.clients.set(userId, ws);
        console.log(`✅ User connected: ${userId}`);
        // Step 4 — Online status broadcast karo
        (0, presenceHandler_1.presenceHandler)(userId, "online");
        // Step 5 — Messages handle karo
        ws.on("message", (data) => {
            try {
                const parsed = JSON.parse(data.toString());
                switch (parsed.type) {
                    case "chat":
                        (0, chatHandler_1.chatHandler)(parsed);
                        break;
                    case "read":
                        (0, readHandler_1.readHandler)(parsed);
                        break;
                    default:
                        console.log("Unknown message type:", parsed.type);
                }
            }
            catch (err) {
                console.error("Invalid message format:", err);
            }
        });
        // Step 6 — User disconnect hone pe
        ws.on("close", () => {
            wsClients_1.clients.delete(userId);
            console.log(` User disconnected: ${userId}`);
            (0, presenceHandler_1.presenceHandler)(userId, "offline");
        });
    });
    console.log(" WebSocket Server Ready");
}
