import * as fs from "fs";
import path from "path";

const dataPath = "./src/database/users.json"; // path to our JSON file

export const saveAccountData = (data: any) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(dataPath, stringifyData);
};

export const getAccountData = () => {
  const jsonData = fs.readFileSync(path.resolve(dataPath));
  return JSON.parse(jsonData.toString());
};

export const getAccountDataByKey = (value: string, key: string) => {
  const jsonData = getAccountData();

  let user: any | undefined;
  for (const entry of Object.entries(jsonData)) {
    if ((entry[1] as any)[key] === value) {
      user = entry[1];
      break;
    }
  }

  return user;
};

export const updateAccountData = (user: any) => {
  const users = getAccountData();
  users[user.id] = user;
  saveAccountData(users);
};
