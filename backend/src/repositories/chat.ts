import * as fs from "fs";
import path from "path";

const dataPath = "./src/database/chat.json"; // path to our JSON file

const saveData = (data: any) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(dataPath, stringifyData);
};

const getData = () => {
  const jsonData = fs.readFileSync(path.resolve(dataPath));
  return JSON.parse(jsonData.toString());
};

// Pra cada conversa a gente vai ter um Salt, esse salt pode ser público e vou.
// Pra gerar a chave que vai ser usada pra criptografar, vou usar esse salt + hash do id da conversa
// Pra gerar o nonce vou usar o salt+timestamp da mensagem

export const insertMessage = async (
  chatId: string,
  sender: { id: number },
  recipient: { id: number },
  message: { text: string; timestamp: string }
) => {
  const chat = getData();
  if (!chat[chatId])
    chat[chatId] = {
      users: { [sender.id]: sender, [recipient.id]: recipient },
      messages: [],
    };

  chat[chatId].messages.push(message);

  saveData(chat);
};

export const getUserChats = (userId: number) => {
  const chats = getData();
  const userChats = [];
  for (const chat of Object.values(chats)) {
    if (Object.keys((chat as any).users).some((k) => parseInt(k) === userId))
      userChats.push(chat);
  }
  return userChats;
};
