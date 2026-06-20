import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.models.js";
import mongoose from "mongoose";


const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    receiver: req.user._id,
    isDeleted: false,
  })
    .populate(
      "sender",
      "fullName username avatar"
    )
    .populate(
      "conversation",
      "participants isGroup groupName"
    )
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      notifications,
      "Notifications fetched successfully"
    )
  );
});


const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  // Find notification
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  // Check ownership
  if (
    notification.receiver.toString() !==
    req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "Unauthorized action"
    );
  }

  // Already read
  if (notification.isRead) {
    return res.status(200).json(
      new ApiResponse(
        200,
        notification,
        "Notification already marked as read"
      )
    );
  }

  // Mark as read
  notification.isRead = true;
  await notification.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      notification,
      "Notification marked as read"
    )
  );
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      receiver: req.user._id,
      isRead: false,
      isDeleted: false,
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "All notifications marked as read"
    )
  );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (
    notification.receiver.toString() !==
    req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "Unauthorized action"
    );
  }

  notification.isDeleted = true;

  await notification.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Notification deleted successfully"
    )
  );
});

const getUnreadNotificationCount = asyncHandler(
  async (req, res) => {
    const unreadCount =
      await Notification.countDocuments({
        receiver: req.user._id,
        isRead: false,
        isDeleted: false,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          unreadCount,
        },
        "Unread notification count fetched successfully"
      )
    );
  }
);

export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUnreadNotificationCount,
};