import { Router } from "express";

import {
  sendMessage,
  getMessages,
  deleteMessage,
  markMessageSeen,
} from "../controllers/message.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Send Message
router.route("/").post(
  verifyJWT,
  sendMessage
);

// Get Messages of a Conversation
router.route("/:conversationId").get(
  verifyJWT,
  getMessages
);

// Mark Message as Seen
router.route("/seen/:messageId").patch(
  verifyJWT,
  markMessageSeen
);

// Delete Message
router.route("/:messageId").delete(
  verifyJWT,
  deleteMessage
);

export default router;