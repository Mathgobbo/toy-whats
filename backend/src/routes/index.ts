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

const router = express.Router();

router.get("/users", getUsers);

router.post("/auth/sign-up", signUp);
router.post("/auth/sign-in", signIn);

router.post("/auth/generate-otp", generateOtp);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/validate-otp", validateOtp);
router.post("/auth/disable-otp", disableOtp);
// generata TOTP
// Validate TOTP
// 2 routes related to TOTP

// Routes related to the messages

export default router;
