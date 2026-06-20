import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/User.models";
import { FriendRequest } from "../models/friendRequest.model";
import { Notification } from "../models/notification.models";
import mongoose from "mongoose";


const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  // Validate User Id
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid user id");
  }

  // Prevent self request
  if (req.user?._id.toString() === receiverId) {
    throw new ApiError(
      400,
      "You cannot send a friend request to yourself"
    );
  }

  // Check receiver exists
  const receiver = await User.findById(receiverId);

  if (!receiver) {
    throw new ApiError(404, "User not found");
  }

  // Already friends
  const alreadyFriend = await User.findOne({
    _id: req.user._id,
    friends: receiverId,
  });

  if (alreadyFriend) {
    throw new ApiError(
      400,
      "User is already your friend"
    );
  }

  // Check existing pending request from either side
  const existingRequest = await FriendRequest.findOne({
    $or: [
      {
        sender: req.user._id,
        receiver: receiverId,
        status: "pending",
      },
      {
        sender: receiverId,
        receiver: req.user._id,
        status: "pending",
      },
    ],
  });

  if (existingRequest) {
    throw new ApiError(
      400,
      "Friend request already exists"
    );
  }

  // Create friend request
  const friendRequest = await FriendRequest.create({
    sender: req.user._id,
    receiver: receiverId,
  });

  // Create notification
  await Notification.create({
    sender: req.user._id,
    receiver: receiverId,
    type: "friend_request",
    content: `${req.user.fullName} sent you a friend request.`,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      friendRequest,
      "Friend request sent successfully"
    )
  );
});

