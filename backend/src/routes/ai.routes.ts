import { Router } from "express";
import { chatWithAI } from "../controllers/ai.controller.js";
import { protectAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/chat", protectAuth, chatWithAI);

export default router;
