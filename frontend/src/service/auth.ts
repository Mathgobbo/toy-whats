import axios from "axios";
import { User } from "../types/User";

const BACKEND_URL = "http://localhost:3000";

export const signIn = async (username: string, password: string) => {
  const { data } = await axios.post<User>(BACKEND_URL + "/auth/sign-in", {
    username,
    password,
  });
  return data;
};

export const signUp = async (
  username: string,
  password: string,
  phone: string
) => {
  const { data } = await axios.post<User>(BACKEND_URL + "/auth/sign-up", {
    username,
    password,
    phone,
  });
  return data;
};
