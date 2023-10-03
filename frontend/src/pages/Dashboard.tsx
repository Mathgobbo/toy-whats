import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { socket } from "../service/socket";
import { getUsers } from "../service/users";
import { User } from "../types/User";
import {
  decryptMessage,
  encryptMessage,
  generateChatId,
} from "../service/crypto";

export const DashboardPage = () => {
  const { isConnected, connect, disconnect } = useSocket();

  return (
    <main>
      <p>Esta conectado: {isConnected.toString()}</p>
      <ChatList />
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>DIS Connect</button>
      <MessageForm />
    </main>
  );
};

const ChatList = () => {
  const { chats } = useSocket();
  const { user } = useAuth();
  const [openedChat, setOpenedChat] = useState<string>();
  const currentChat = chats.find((c) => c.id === openedChat);

  return (
    <section>
      <div>
        {chats.map((c) => {
          const otherUser = Object.values(c.users).find(
            (u) => u.id != user?.id
          );
          return (
            <div onClick={() => setOpenedChat(c.id)}>
              {otherUser?.id} - {otherUser?.username}
            </div>
          );
        })}
      </div>

      <div>
        {currentChat &&
          currentChat.messages.map((message) => {
            const sender = currentChat.users[message.senderId];
            const decrypted = decryptMessage(
              message.text,
              message.timestamp,
              currentChat.id,
              currentChat.salt
            );
            return (
              <>
                <hr />
                <div style={{ display: "flex" }}>
                  <h3>{message.text}</h3> <br />
                  <h4 style={{ fontSize: 8 }}>{message.timestamp}</h4>
                  <h5>{sender?.username}</h5>
                  <h3>{decrypted}</h3>
                </div>
              </>
            );
          })}
      </div>
    </section>
  );
};

const MessageForm = () => {
  const { chats } = useSocket();
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;

    // eslint-disable-next-line prefer-const
    let { id, salt } = generateChatId(
      user?.id as string,
      target["recipient"].value
    );
    const existingChat = chats.find((chat) => chat.id === id);
    if (existingChat) salt = existingChat.salt;

    const recipient = users.find((u) => target["recipient"].value == u.id);

    const timestamp = new Date().toISOString();
    const encryptedMessage = encryptMessage(
      target["message-text"].value,
      timestamp,
      id,
      salt
    );

    socket.emit("new-mesage", {
      chatId: id,
      chatSalt: salt,
      message: {
        text: encryptedMessage,
        timestamp,
        senderId: user?.id,
      },
      recipient: { id: target["recipient"].value, ...recipient },
      sender: user,
    });
  };

  const loadUsers = async () => {
    const users = await getUsers();
    console.log(users);
    setUsers(Object.values(users));
  };

  useEffect(() => {
    loadUsers();
  }, []);
  return (
    <form onSubmit={onSubmit}>
      <input name="message-text" type="text" />
      <select name="recipient" id="recipient">
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
      <input type="submit" />
    </form>
  );
};
