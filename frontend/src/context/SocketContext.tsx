import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { socket } from "../service/socket";
import { useAuth } from "./AuthContext";
import { Chat } from "../types/Chat";

const SocketContext = createContext({
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  chats: [] as Chat[],
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);

  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  useEffect(() => {
    function onConnect() {
      console.log("Connected");
      setIsConnected(true);
      socket.emit("joining-chat", user?.id);
    }

    function onDisconnect() {
      console.log("DISConnected");
      setIsConnected(false);
    }

    function onChatMessage(chats: Chat[]) {
      setChats(chats);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-message", onChatMessage);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [user?.id]);
  return (
    <SocketContext.Provider value={{ isConnected, connect, disconnect, chats }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
