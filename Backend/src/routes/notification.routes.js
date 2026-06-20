import { Router } from "express";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUnreadNotificationCount,
} from "../controllers/notifications.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get all notifications
router.route("/").get(
  verifyJWT,
  getNotifications
);

// Get unread notification count
router.route("/unread-count").get(
  verifyJWT,
  getUnreadNotificationCount
);

// Mark single notification as read
router.route("/read/:notificationId").patch(
  verifyJWT,
  markNotificationRead
);

// Mark all notifications as read
router.route("/read-all").patch(
  verifyJWT,
  markAllNotificationsRead
);

// Delete notification
router.route("/:notificationId").delete(
  verifyJWT,
  deleteNotification
);

export default router;