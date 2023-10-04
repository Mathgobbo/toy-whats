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

    const newUser = {
      username,
      phone,
      password: hashedPass,
      salt,
      id: newId,
      otpEnabled: false,
    };
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

    // Getting user by username
    const user = getAccountDataByKey(username, "username");
    if (!user) throw new Error("user not found");

    // Generating the hashed password using existing user Salt and password
    // from request body
    const hashedPass = crypto
      .scryptSync(password, user.salt, SCRYPT_KEY_LEN, {
        N: 2048,
        p: 1,
        blockSize: 8,
      })
      .toString("hex");

    if (user.password != hashedPass) throw new Error("Invalid Password");

    return res.send({
      id: user.id,
      username: user.username,
      phone: user.phone,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: (error as Error).message });
  }
};

// =========================== TOTP FUNCTIONS ===========================
// TOTP = Time-based one time Password

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
 * Function to generate the OTP Url and OTP Secret
 * for the user.
 *
 * @param req
 * @param res
 * @returns
 */
export const generateOtp = async (req: Request, res: Response) => {
  try {
    // OTP secret should be a base32 string
    const { id } = req.body;
    if (!id) throw new Error("missing params");

    const user = getAccountDataByKey(id, "id");
    if (!user) throw new Error("User not found");

    const secret = generateRandomBase32();

    const totp = new OTPAuth.TOTP({
      issuer: "ToyWhats",
      label: user.username,
      algorithm: "SHA1",
      period: 30,
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

/**
 * Function to verify if the token sent by the User is valid!
 * This endpoint also updates the flag "otpEnabled" from the User
 * if the token is valid
 *
 * @param req
 * @param res
 * @returns
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    // Getting params
    const { id, token } = req.body;
    if (!id || !token) throw new Error("Missing params");

    // Getting user by ID
    const user = getAccountDataByKey(id, "id");
    if (!user) throw new Error("User not found");

    // Validating if user has OTP Secret
    if (!user.otpSecret) throw new Error("Generate secret first!");

    // Generating TOTP Object
    const totp = new OTPAuth.TOTP({
      issuer: "ToyWhats",
      label: user.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: user.otpSecret,
    });

    // Validating Token sent by the user
    const delta = totp.validate({ token });

    // If `delta` is null, means that the token is invalid
    if (delta == null) throw new Error("Invalid Token");

    // Updating user
    user["otpEnabled"] = true;
    updateAccountData(user);

    // Returning...
    res.send({ message: "OTP Enabled!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: (error as Error).message });
  }
};

/**
 * Function to validate the token ao an user
 * that already enabled the 2FA and also verified!
 *
 * @param req
 * @param res
 * @returns
 */
export const validateOtp = async (req: Request, res: Response) => {
  try {
    // Getting params
    const { id, token } = req.body;
    if (!id || !token) throw new Error("Missing params");

    // Getting user by ID
    const user = getAccountDataByKey(id, "id");
    if (!user) throw new Error("User not found");

    // Validating if user has OTP enabled
    // (which means he already verified the token)
    if (!user.otpEnabled)
      throw new Error("Enable 2FA first (Using verifying endpoint)");

    // Generating TOTP Object
    const totp = new OTPAuth.TOTP({
      issuer: "ToyWhats",
      label: user.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: user.otpSecret,
    });

    // Validating Token sent by the user
    const delta = totp.validate({ token });

    // If `delta` is null, means that the token is invalid
    if (delta == null) throw new Error("Invalid Token");

    // Returning...
    res.send({ message: "OTP valid" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: (error as Error).message });
  }
};

/**
 * Function to disable User's 2FA
 * Which means that after sucessfuly calling this function
 * He will have to call the `verifyOtp` endpoint again!
 *
 * @param req
 * @param res
 * @returns
 */
export const disableOtp = async (req: Request, res: Response) => {
  try {
    // Getting params
    const { id } = req.body;
    if (!id) throw new Error("Missing params");

    // Getting user by ID
    const user = getAccountDataByKey(id, "id");
    if (!user) throw new Error("User not found");

    // Validating if user has OTP Secret
    if (!user.otpEnabled) throw new Error("2FA Already Disabled");

    // Updating user
    user["otpEnabled"] = false;
    updateAccountData(user);

    // Returning...
    res.send({ message: "OTP DISABLED!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: (error as Error).message });
  }
};
