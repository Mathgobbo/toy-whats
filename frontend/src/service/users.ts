import axios from "axios";

const BACKEND_URL = "http://localhost:3000";

export const getUsers = async () => {
  const { data } = await axios.get(BACKEND_URL + "/users");
  return data;
};
