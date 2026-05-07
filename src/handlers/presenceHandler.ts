import { clients } from "../websockets/wsClients";

export function presenceHandler(userId: string, status: "online" | "offline") {
  
  // Yeh message banega jo sab ko bhejenge
  const message = JSON.stringify({
    type: "presence",
    userId,
    status, // "online" ya "offline"
  });

  // Map mein se har connected user ko yeh message bhejo
  clients.forEach((clientWs, clientId) => {
    
    // Apne aap ko mat batao — doosron ko batao
    if (clientId !== userId) {
      clientWs.send(message);
    }
  });

  console.log(` User ${userId} is now ${status}`);
}