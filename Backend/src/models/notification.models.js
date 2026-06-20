import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "friend_request",
        "friend_accept",
        "message",
      ],
      required: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Receiver notifications
notificationSchema.index({
  receiver: 1,
  createdAt: -1,
});

// Unread notifications
notificationSchema.index({
  receiver: 1,
  isRead: 1,
});

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);