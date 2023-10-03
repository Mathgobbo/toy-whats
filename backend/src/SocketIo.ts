import { Server } from "socket.io";
import { server } from "./Express";
import { getChats, newMessage } from "./controllers/chat";

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5173",
  },
});

io.on("connect", (socket) => {
  console.log("a user connected");

  socket.on("joining-chat", getChats);
  socket.on("new-mesage", newMessage);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

export { io };
