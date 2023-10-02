import { useSocket } from "../context/SocketContext";

export const DashboardPage = () => {
  const { isConnected, connect, disconnect, chats } = useSocket();
  return (
    <main>
      Authenticated <p>Esta conectado: {isConnected.toString()}</p>
      <p>{JSON.stringify(chats)}</p>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>DIS Connect</button>
      <form action=""></form>
    </main>
  );
};
