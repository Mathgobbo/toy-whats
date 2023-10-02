import express from "express";
import { getUsers } from "../controllers/user";
import {
  disableOtp,
  generateOtp,
  signIn,
  signUp,
  validateOtp,
  verifyOtp,
} from "../controllers/auth";
import * as crypto from "crypto";
import { io } from "../SocketIo";

const router = express.Router();

router.get("/users", getUsers);

router.post("/auth/sign-up", signUp);
router.post("/auth/sign-in", signIn);

router.post("/auth/generate-otp", generateOtp);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/validate-otp", validateOtp);
router.post("/auth/disable-otp", disableOtp);
router.post("/auth/test", (req, res) => {
  const algorithm = "aes-256-gcm",
    password = "3zTvzr3p67VC61jmV54rIYu1545x4TlY",
    // do not use a global iv for production,
    // generate a new one for each encryption
    iv = "60iP0h6vJoEa";

  var cipher = crypto.createCipheriv(algorithm, password, iv);
  var encrypted = cipher.update("Batata", "utf-8", "hex");
  console.log(encrypted);
  encrypted += cipher.final("hex");
  console.log(encrypted);
  var tag = cipher.getAuthTag();
  res.send({ content: encrypted, tag });
});

export default router;
