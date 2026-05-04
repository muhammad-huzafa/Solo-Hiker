import { prisma } from "../lib/prisma";
import { clients } from "../websockets/wsClients";

export async function readHandler(data: {
  messageId: string;
  readerId: string;
  senderId: string;
}) {
  const { messageId, readerId, senderId } = data;

  // Step 1 — Database mein message update karo
  const message = await prisma.message.update({
    where: { id: messageId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  // Step 2 — Original sender ko batao message padh liya gaya
  const senderSocket = clients.get(senderId);
  if (senderSocket) {
    senderSocket.send(
      JSON.stringify({
        type: "read",
        messageId,
        readerId,
        readAt: message.readAt,
      })
    );
  }

  console.log(` Message ${messageId} read by ${readerId}`);
}
