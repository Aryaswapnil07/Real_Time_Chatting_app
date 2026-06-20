import { Router } from "express";

import {
  createConversation,
  getMyConversations,
  getConversationById,
} from "../controllers/conversation.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Create a new conversation
router.route("/").post(
  verifyJWT,
  createConversation
);

// Get all conversations of logged in user
router.route("/").get(
  verifyJWT,
  getMyConversations
);

// Get conversation by id
router.route("/:conversationId").get(
  verifyJWT,
  getConversationById
);

export default router;