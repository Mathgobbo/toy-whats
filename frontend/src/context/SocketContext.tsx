import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { socket } from "../service/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext({
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  chats: [] as { message: string }[],
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const { user } = useAuth();
  const [chats, setChats] = useState<{ message: string }[]>([]);

  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  useEffect(() => {
    function onConnect() {
      console.log("Connected");
      socket.emit("joining-chat", user?.id);
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("DISConnected");
      setIsConnected(false);
    }

    function onChatMessage(chats: { message: string }[]) {
      setChats(chats);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-message", onChatMessage);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);
  return (
    <SocketContext.Provider value={{ isConnected, connect, disconnect, chats }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
