import { io } from "../SocketIo";
import { getUserChats, insertMessage } from "../repositories/chat";

/**
 * Function to get the chats of an User
 * @param userId
 */
export const getChats = (userId: number) => {
  const chats = getUserChats(userId);
  io.emit("chat-message", chats);
};

/**
 * Function that inserts a new message in the storage
 * Here, the data is already encrypted
 *
 * It also emits the `chat-message` event, with the user chats
 * @param params
 */
export const newMessage = (params: {
  chatId: string;
  chatSalt: string;
  sender: { id: number };
  recipient: { id: number };
  message: { text: string; timestamp: string };
}) => {
  const { chatId, message, recipient, sender, chatSalt } = params;
  insertMessage(chatId, sender, recipient, message, chatSalt);

  const chats = getUserChats(sender.id);
  io.emit("chat-message", chats);
};
