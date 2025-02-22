import express from "express";
import {createCurrentUser } from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { updateCurrentUser } from "../controllers/MyUserController";
import { validateMyUserRequest } from "../middleware/validation";
import { getCurrentUser } from "../controllers/MyUserController"
const router = express.Router();

router.get("/", jwtCheck, jwtParse , getCurrentUser)
router.post("/", jwtCheck, jwtParse, createCurrentUser);
router.put("/", jwtCheck, jwtParse, validateMyUserRequest, updateCurrentUser); // ✅ jwtParse included

export default router;