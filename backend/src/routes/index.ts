import express from "express";
import { getUsers } from "../controllers/user";
import { signIn, signUp } from "../controllers/auth";

const router = express.Router();

router.get("/users", getUsers);

router.post("/auth/sign-up", signUp);
router.post("/auth/sign-in", signIn);

export default router;
