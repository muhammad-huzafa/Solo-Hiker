import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { clients } from "./wsClients";
import { chatHandler } from "../handlers/chatHandler";
import { typingHandler } from "../handlers/typingHandler";
import { presenceHandler } from "../handlers/presenceHandler";
import { readHandler } from "../handlers/readHandler";

export function initWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket, req) => {

    // Step 1 — URL se userId nikalo
    const url = new URL(req.url!, `http://localhost`);
    const userId = url.searchParams.get("userId");

    // Step 2 — userId nahi hai toh connection close karo
    if (!userId) {
      ws.close();
      return;
    }

    // Step 3 — Client ko Map mein store karo
    clients.set(userId, ws);
    console.log(`✅ User connected: ${userId}`);
    const onlineList = Array.from(clients.keys()).filter(id => id !== userId);
    onlineList.forEach(onlineUserId => {
    ws.send(JSON.stringify({
    type: "presence",
    userId: onlineUserId,
    status: "online",
  }));
});

    // Step 4 — Online status broadcast karo
    presenceHandler(userId, "online");

    // Step 5 — Messages handle karo
    ws.on("message", (data: string) => {
      try {
        const parsed = JSON.parse(data.toString());

        switch (parsed.type) {
          case "chat":
            chatHandler(parsed);
            break;
          case "read":
            readHandler(parsed);
            break;
          case "typing":
            typingHandler(parsed);
            break;
          default:
            console.log("Unknown message type:", parsed.type);
        }
      } catch (err) {
        console.error("Invalid message format:", err);
      }
    });

    // Step 6 — User disconnect hone pe
    ws.on("close", () => {
      clients.delete(userId);
      console.log(` User disconnected: ${userId}`);
      presenceHandler(userId, "offline");
    });

  });

  console.log(" WebSocket Server Ready");
}