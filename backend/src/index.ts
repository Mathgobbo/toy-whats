import { server } from "./Express";
import "./SocketIo";

server.listen(3000, () => {
  console.log("listening");
});
