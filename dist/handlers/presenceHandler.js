"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presenceHandler = presenceHandler;
const wsClients_1 = require("../websockets/wsClients");
function presenceHandler(userId, status) {
    // Yeh message banega jo sab ko bhejenge
    const message = JSON.stringify({
        type: "presence",
        userId,
        status, // "online" ya "offline"
    });
    // Map mein se har connected user ko yeh message bhejo
    wsClients_1.clients.forEach((clientWs, clientId) => {
        // Apne aap ko mat batao — doosron ko batao
        if (clientId !== userId) {
            clientWs.send(message);
        }
    });
    console.log(` User ${userId} is now ${status}`);
}
