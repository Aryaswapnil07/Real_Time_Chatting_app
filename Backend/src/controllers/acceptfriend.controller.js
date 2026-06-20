import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/User.models";
import { FriendRequest } from "../models/friendRequest.model";
import { Notification } from "../models/notification.models";
import mongoose from "mongoose";


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

  return res.status(200).json(
    new ApiResponse(
      200,
      friendRequest,
      "Friend request accepted"
    )
  );
});