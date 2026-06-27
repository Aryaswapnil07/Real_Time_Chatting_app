import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Conversation } from "../models/conversation.models.js";
import mongoose from "mongoose";

const createConversation = asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    throw new ApiError(400, "Participant id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    throw new ApiError(400, "Invalid participant id");
  }

  if (participantId === req.user._id.toString()) {
    throw new ApiError(
      400,
      "You cannot create a conversation with yourself"
    );
  }

  const participant = await User.findById(participantId);

  if (!participant) {
    throw new ApiError(404, "User not found");
  }

  const existingConversation = await Conversation.findOne({
    isGroup: false,
    participants: {
      $all: [req.user._id, participantId],
    },
  });

  if (existingConversation) {
    return res.status(200).json(
      new ApiResponse(
        200,
        existingConversation,
        "Conversation already exists"
      )
    );
  }

  const conversation = await Conversation.create({
    participants: [
      req.user._id,
      participantId,
    ],
  });

  const createdConversation =
    await Conversation.findById(
      conversation._id
    ).populate(
      "participants",
      "fullName username avatar"
    );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdConversation,
        "Conversation created successfully"
      )
    );
});

const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isArchived: false,
  })
    .populate(
      "participants",
      "fullName username avatar isOnline lastSeen"
    )
    .populate({
      path: "lastMessage",
      match: {
        isDeleted: false,
      },
      populate: {
        path: "sender",
        select: "fullName avatar",
      },
    })
    .sort({
      updatedAt: -1,
    });

  return res.status(200).json(
    new ApiResponse(
      200,
      conversations,
      "Conversations fetched successfully"
    )
  );
});

const getConversationById = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId
    )
  ) {
    throw new ApiError(
      400,
      "Invalid conversation id"
    );
  }

  const conversation =
    await Conversation.findById(
      conversationId
    )
      .populate(
        "participants",
        "fullName username avatar bio isOnline lastSeen"
      )
      .populate({
        path: "lastMessage",
        match: {
          isDeleted: false,
        },
        populate: {
          path: "sender",
          select: "fullName avatar",
        },
      });

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found"
    );
  }

  const isParticipant =
    conversation.participants.some(
      (participant) =>
        participant._id.toString() ===
        req.user._id.toString()
    );

  if (!isParticipant) {
    throw new ApiError(
      403,
      "Unauthorized access"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      conversation,
      "Conversation fetched successfully"
    )
  );
});

export {
  createConversation,
  getMyConversations,
  getConversationById,
};
