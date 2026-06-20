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
    throw new ApiError(400, "You cannot send a friend request to yourself");
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
    throw new ApiError(400, "User is already your friend");
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
    throw new ApiError(400, "Friend request already exists");
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

  return res
    .status(201)
    .json(
      new ApiResponse(201, friendRequest, "Friend request sent successfully")
    );
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid request id");
  }

  const friendRequest = await FriendRequest.findById(requestId);

  if (!friendRequest) {
    throw new ApiError(404, "Friend request not found");
  }

  if (friendRequest.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized action");
  }

  if (friendRequest.status !== "pending") {
    throw new ApiError(400, "Friend request already processed");
  }

  friendRequest.status = "accepted";
  await friendRequest.save();

  await User.findByIdAndUpdate(friendRequest.sender, {
    $addToSet: {
      friends: friendRequest.receiver,
    },
  });

  await User.findByIdAndUpdate(friendRequest.receiver, {
    $addToSet: {
      friends: friendRequest.sender,
    },
  });

  await Notification.create({
    sender: req.user._id,
    receiver: friendRequest.sender,
    type: "friend_accept",
    content: `${req.user.fullName} accepted your friend request.`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, friendRequest, "Friend request accepted"));
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid request id");
  }

  const friendRequest = await FriendRequest.findById(requestId);

  if (!friendRequest) {
    throw new ApiError(404, "Friend request not found");
  }

  if (friendRequest.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (friendRequest.status !== "pending") {
    throw new ApiError(400, "Request already processed");
  }

  friendRequest.status = "rejected";
  await friendRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, friendRequest, "Friend request rejected"));
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  // Validate request id
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid request id");
  }

  // Find friend request
  const friendRequest = await FriendRequest.findById(requestId);

  if (!friendRequest) {
    throw new ApiError(404, "Friend request not found");
  }

  // Only sender can cancel
  if (friendRequest.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this request");
  }

  // Request must be pending
  if (friendRequest.status !== "pending") {
    throw new ApiError(400, "Only pending friend requests can be cancelled");
  }

  // Delete request
  await FriendRequest.findByIdAndDelete(requestId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Friend request cancelled successfully"));
});
const getPendingFriendRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    receiver: req.user._id,
    status: "pending",
  })
    .populate("sender", "fullName username avatar bio")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requests,
        "Pending friend requests fetched successfully"
      )
    );
});
const getSentFriendRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    sender: req.user._id,
    status: "pending",
  })
    .populate("receiver", "fullName username avatar bio")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requests,
        "Sent friend requests fetched successfully"
      )
    );
});

const getFriendsList = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("friends", "fullName username avatar bio isOnline lastSeen")
    .select("friends");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user.friends, "Friends fetched successfully"));
});
const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    throw new ApiError(400, "Invalid friend id");
  }

  const friend = await User.findById(friendId);

  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: {
      friends: friendId,
    },
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: {
      friends: req.user._id,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Friend removed successfully"));
});

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getPendingFriendRequests,
  getSentFriendRequests,
  getFriendsList,
  removeFriend,
};
