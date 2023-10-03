import express from "express";
import {
  disableOtp,
  generateOtp,
  signIn,
  signUp,
  validateOtp,
  verifyOtp,
} from "../controllers/auth";
import { getUsers } from "../controllers/user";

const router = express.Router();

router.get("/users", getUsers);

router.post("/auth/sign-up", signUp);
router.post("/auth/sign-in", signIn);

router.post("/auth/generate-otp", generateOtp);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/validate-otp", validateOtp);
router.post("/auth/disable-otp", disableOtp);

export default router;
