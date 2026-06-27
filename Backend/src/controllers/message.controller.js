import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Conversation } from "../models/conversation.models.js";
import { Message } from "../models/message.models.js";
import { getIO } from "../socket/socket.js";

const isParticipant = (conversation, userId) =>
  conversation.participants.some(
    (participant) => participant.toString() === userId.toString()
  );

const emitToParticipants = (conversation, eventName, payload) => {
  const io = getIO();

  conversation.participants.forEach((participantId) => {
    io.to(participantId.toString()).emit(eventName, payload);
  });
};

const getConversationForUser = async (conversationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation id");
  }

  const conversation = await Conversation.findById(conversationId).select(
    "participants lastMessage"
  );

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (!isParticipant(conversation, userId)) {
    throw new ApiError(403, "Unauthorized");
  }

  return conversation;
};

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text, image, audio, replyTo } = req.body;
  const normalizedText = typeof text === "string" ? text.trim() : "";
  const normalizedImage = typeof image === "string" ? image.trim() : "";
  const normalizedAudio = typeof audio === "string" ? audio.trim() : "";

  if (!conversationId) {
    throw new ApiError(400, "Conversation id is required");
  }

  if (!normalizedText && !normalizedImage && !normalizedAudio) {
    throw new ApiError(400, "Message content is required");
  }

  if (replyTo && !mongoose.Types.ObjectId.isValid(replyTo)) {
    throw new ApiError(400, "Invalid reply message id");
  }

  const conversation = await getConversationForUser(conversationId, req.user._id);

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text: normalizedText,
    image: normalizedImage,
    audio: normalizedAudio,
    replyTo: replyTo || null,
    seenBy: [req.user._id],
  });

  await message.populate("sender", "fullName username avatar");

  conversation.lastMessage = message._id;
  await conversation.save();

  emitToParticipants(conversation, "newMessage", message);

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await getConversationForUser(conversationId, req.user._id);

  const messages = await Message.find({
    conversation: conversationId,
    isDeleted: false,
  })
    .populate("sender", "fullName username avatar")
    .populate("replyTo")
    .sort({
      createdAt: 1,
    });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message id");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const conversation = await Conversation.findById(message.conversation).select(
    "participants lastMessage updatedAt"
  );

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  message.isDeleted = true;
  await message.save();

  let lastMessage = null;
  let lastMessageUpdated = false;

  if (conversation.lastMessage?.toString() === message._id.toString()) {
    lastMessage = await Message.findOne({
      conversation: message.conversation,
      isDeleted: false,
    })
      .populate("sender", "fullName username avatar")
      .sort({
        createdAt: -1,
      });

    conversation.lastMessage = lastMessage?._id || null;
    await conversation.save();
    lastMessageUpdated = true;
  }

  emitToParticipants(conversation, "messageDeleted", {
    messageId: message._id.toString(),
    conversationId: message.conversation.toString(),
    lastMessage,
    lastMessageUpdated,
    conversationUpdatedAt: conversation.updatedAt,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Message deleted"));
});

const markMessageSeen = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message id");
  }

  const message = await Message.findById(messageId);

  if (!message || message.isDeleted) {
    throw new ApiError(404, "Message not found");
  }

  await getConversationForUser(message.conversation, req.user._id);

  await Message.findByIdAndUpdate(messageId, {
    $addToSet: {
      seenBy: req.user._id,
    },
  });

  getIO()
    .to(message.sender.toString())
    .emit("messageSeen", {
      messageId,
      seenBy: req.user._id.toString(),
    });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message marked as seen"));
});

export { sendMessage, getMessages, deleteMessage, markMessageSeen };
