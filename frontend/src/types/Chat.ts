import { User } from "./User";

export type Chat = {
  id: string;
  salt: string;
  messages: {
    text: string;
    timestamp: string;
    senderId: string;
  }[];
  users: {
    [userId: string]: User;
  };
};
