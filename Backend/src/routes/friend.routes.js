import { Router } from "express";

import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getPendingFriendRequests,
  getSentFriendRequests,
  getFriendsList,
  removeFriend,
} from "../controllers/friendrequest.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected Routes

// Send Friend Request
router.route("/send/:receiverId").post(
  verifyJWT,
  sendFriendRequest
);

// Accept Friend Request
router.route("/accept/:requestId").patch(
  verifyJWT,
  acceptFriendRequest
);

// Reject Friend Request
router.route("/reject/:requestId").patch(
  verifyJWT,
  rejectFriendRequest
);

// Cancel Sent Friend Request
router.route("/cancel/:requestId").delete(
  verifyJWT,
  cancelFriendRequest
);

// Pending Requests
router.route("/pending").get(
  verifyJWT,
  getPendingFriendRequests
);

// Sent Requests
router.route("/sent").get(
  verifyJWT,
  getSentFriendRequests
);

// Friends List
router.route("/list").get(
  verifyJWT,
  getFriendsList
);

// Remove Friend
router.route("/remove/:friendId").delete(
  verifyJWT,
  removeFriend
);

export default router;