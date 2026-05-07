"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatHandler = chatHandler;
const prisma_1 = require("../lib/prisma");
const wsClients_1 = require("../websockets/wsClients");
async function chatHandler(data) {
    const { senderId, receiverId, conversationId, text, senderName } = data;
    // Step 1 — Message database mein save karo
    const message = await prisma_1.prisma.message.create({
        data: {
            conversationId,
            senderId,
            senderName,
            text,
            isRead: false,
        },
    });
    // Step 2 — Conversation ka lastMessage update karo
    await prisma_1.prisma.conversation.update({
        where: { id: conversationId },
        data: {
            lastMessage: text,
            lastMessageTime: new Date(),
        },
    });
    // Step 3 — Receiver online hai toh directly bhejo
    const receiverSocket = wsClients_1.clients.get(receiverId);
    if (receiverSocket) {
        receiverSocket.send(JSON.stringify({
            type: "chat",
            message,
        }));
    }
    // Step 4 — Sender ko bhi confirm karo message deliver hua
    const senderSocket = wsClients_1.clients.get(senderId);
    if (senderSocket) {
        senderSocket.send(JSON.stringify({
            type: "chat",
            message,
        }));
    }
    console.log(` Message from ${senderId} to ${receiverId}`);
}
