import { io } from "../SocketIo";
import { getUserChats, insertMessage } from "../repositories/chat";

export const addMessage = (
  chatId: string,
  sender: { id: number },
  recipient: { id: number },
  message: { text: string; timestamp: string }
) => {
  insertMessage(chatId, sender, recipient, message);
};

export const getChats = (userId: number) => {
  console.log(userId);
  const chats = getUserChats(userId);
  console.log(chats);
  io.emit("chat-message", chats);
};
