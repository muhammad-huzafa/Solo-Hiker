import { clients } from "../websockets/wsClients";

export function typingHandler(data: {
  senderId: string;
  receiverId: string;
  isTyping: boolean;
}) {
  const { senderId, receiverId, isTyping } = data;

  const receiverSocket = clients.get(receiverId);
  if (receiverSocket) {
    receiverSocket.send(JSON.stringify({
      type: "typing",
      senderId,
      isTyping,
    }));
  }
}