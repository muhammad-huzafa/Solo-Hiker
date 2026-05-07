"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readHandler = readHandler;
const prisma_1 = require("../lib/prisma");
const wsClients_1 = require("../websockets/wsClients");
async function readHandler(data) {
    const { messageId, readerId, senderId } = data;
    // Step 1 — Database mein message update karo
    const message = await prisma_1.prisma.message.update({
        where: { id: messageId },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });
    // Step 2 — Original sender ko batao message padh liya gaya
    const senderSocket = wsClients_1.clients.get(senderId);
    if (senderSocket) {
        senderSocket.send(JSON.stringify({
            type: "read",
            messageId,
            readerId,
            readAt: message.readAt,
        }));
    }
    console.log(` Message ${messageId} read by ${readerId}`);
}
