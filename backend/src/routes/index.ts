import express from "express";
import { getUsers } from "../controllers/user";
import { signIn, signUp } from "../controllers/auth";

const router = express.Router();

router.get("/users", getUsers);

router.post("/auth/sign-up", signUp);
router.post("/auth/sign-in", signIn);

// generata TOTP
// Validate TOTP
// 2 routes related to TOTP

// Routes related to the messages

export default router;
