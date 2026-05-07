import { prisma } from "../lib/prisma";
import { clients } from "../websockets/wsClients";

export async function chatHandler(data: {
  senderId: string;
  receiverId: string;
  conversationId: string;
  text: string;
  senderName: string;
}) {
  const { senderId, receiverId, conversationId, text, senderName } = data;

  // Step 1 — Message database mein save karo
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      senderName,
      text,
      isRead: false,
    },
  });

  // Step 2 — Conversation ka lastMessage update karo
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: text,
      lastMessageTime: new Date(),
    },
  });

  // Step 3 — Receiver online hai toh directly bhejo
  const receiverSocket = clients.get(receiverId);
  if (receiverSocket) {
    receiverSocket.send(
      JSON.stringify({
        type: "chat",
        message,
      })
    );
  }

  // Step 4 — Sender ko bhi confirm karo message deliver hua
  const senderSocket = clients.get(senderId);
  if (senderSocket) {
    senderSocket.send(
      JSON.stringify({
        type: "chat",
        message,
      })
    );
  }

  console.log(` Message from ${senderId} to ${receiverId}`);
}