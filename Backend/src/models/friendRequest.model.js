import mongoose, { Schema } from "mongoose";

const friendRequestSchema = new Schema(
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

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate requests
friendRequestSchema.index(
  {
    sender: 1,
    receiver: 1,
  },
  {
    unique: true,
  }
);

// Fast lookup
friendRequestSchema.index({
  receiver: 1,
  status: 1,
});

// Prevent self friend request
friendRequestSchema.pre("save", function () {
  if (this.sender.equals(this.receiver)) {
    throw new Error(
      "You cannot send a friend request to yourself."
    );
  }
});

export const FriendRequest =
  mongoose.models.FriendRequest ||
  mongoose.model(
    "FriendRequest",
    friendRequestSchema
  );