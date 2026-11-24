import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import { chatWithAI } from "../controllers/ai.controller.js";

const router = express.Router();

// Protect AI API using JWT authentication
router.use(protect);

// Send message to AI Assistant
router.post("/chat", chatWithAI);

export default router;