import { Request, Response } from "express";
import { getAccountData } from "../repositories/user";

export const getUsers = async (req: Request, res: Response) => {
  return res.send(getAccountData());
};
