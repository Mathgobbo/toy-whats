import * as crypto from "crypto";
import { Request, Response } from "express";
import { SCRYPT_KEY_LEN } from "../config/constants";
import {
  getAccountData,
  getAccountDataByKey,
  saveAccountData,
  updateAccountData,
} from "../repositories/user";
import { encode } from "hi-base32";
import * as OTPAuth from "otpauth";

/**
 * Function to generate a Random Base32 string
 * that is used as secret of the User for the TOTP
 * protocol
 *
 * @returns Base32 string
 */
const generateRandomBase32 = (bytes = 32) => {
  const buffer = crypto.randomBytes(bytes);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};

/**
 * Function to sign up a new User
 * Using KFD algorithmns and more
 *
 * @param req
 * @param res
 * @returns
 */
export const signUp = async (req: Request, res: Response) => {
  try {
    // Body params and their validation
    const { username, password, phone } = req.body;
    if (!username || !password || !phone) throw new Error("missing params");

    // Salt generation
    const salt = crypto.randomBytes(16).toString("hex");

    // Hashed password generation
    // Using Scrypt with generated salt and user password
    // Hashed pass with 32 bytes length - 256 bits
    // N => Number of iterations
    // p => threads to run in parallel
    // blockSize => Affects memory and CPU usage ??
    const hashedPass = crypto
      .scryptSync(password, salt, SCRYPT_KEY_LEN, {
        N: 2048,
        p: 1,
        blockSize: 8,
      })
      .toString("hex");

    // Adding user obj to database
    const existingUsers = getAccountData();
    const newId = Object.keys(existingUsers).length + 1;
    const newUser = { username, phone, password: hashedPass, salt, id: newId };
    existingUsers[newId] = newUser;
    saveAccountData(existingUsers);

    return res.send(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: (error as Error).message });
  }
};

/**
 * Function to sign in a User
 * Using the phone to get current user and verify its password
 *
 * @param req
 * @param res
 * @returns
 */
export const signIn = async (req: Request, res: Response) => {
  try {
    // Body params and their validation
    const { username, password } = req.body;
    if (!username || !password) throw new Error("missing params");

    // Getting user by phone
    const user = getAccountDataByKey(username, "username");
    if (!user) throw new Error("user not found");

    // Generating the hashed password using existing user Salt and password
    // from request body
    const hashedPass = crypto
      .scryptSync(password, user.salt, SCRYPT_KEY_LEN)
      .toString("hex");

    if (user.password != hashedPass) throw new Error("Invalid Password");

    return res.send({ id: user.id });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: (error as Error).message });
  }
};

export const generateOtp = async (req: Request, res: Response) => {
  try {
    // Should change to use a session key!!
    // OTP secret should be a base32 string
    const { id } = req.body;
    if (!id) throw new Error("missing params");

    const user = getAccountDataByKey(id, "id");
    if (!user) throw new Error("User not found");

    const secret = generateRandomBase32();

    const totp = new OTPAuth.TOTP({
      issuer: "toy-whats",
      label: "Toy-Whats",
      algorithm: "SHA1",
      digits: 6,
      secret,
    });

    const otpAuthUrl = totp.toString();

    user["othAuthUrl"] = otpAuthUrl;
    user["otpSecret"] = secret;

    updateAccountData(user);

    res.send({
      secret,
      otpAuthUrl,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: (error as Error).message });
  }
};
