import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Conversation } from "../models/conversation.models.js";
import { Message } from "../models/message.models.js";
import { getIO } from "../socket/socket.js";

const sendMessage = asyncHandler(async (req, res) => {
  const {
    conversationId,
    text,
    image,
    audio,
    replyTo,
  } = req.body;

  if (!conversationId) {
    throw new ApiError(
      400,
      "Conversation id is required"
    );
  }

  const conversation =
    await Conversation.findById(
      conversationId
    );

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found"
    );
  }

  const isParticipant =
    conversation.participants.some(
      (participant) =>
        participant.toString() ===
        req.user._id.toString()
    );

  if (!isParticipant) {
    throw new ApiError(
      403,
      "Unauthorized"
    );
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text,
    image,
    audio,
    replyTo,
  });

  await message.populate(
    "sender",
    "fullName username avatar"
  );

  conversation.lastMessage = message._id;
  await conversation.save();

  // Real Time Socket Event

  const io = getIO();

  conversation.participants.forEach(
    (participantId) => {
      if (
        participantId.toString() !==
        req.user._id.toString()
      ) {
        io.to(
          participantId.toString()
        ).emit(
          "newMessage",
          message
        );
      }
    }
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      message,
      "Message sent successfully"
    )
  );
});

const getMessages = asyncHandler(
  async (req, res) => {
    const { conversationId } =
      req.params;

    const messages =
      await Message.find({
        conversation: conversationId,
        isDeleted: false,
      })
        .populate(
          "sender",
          "fullName username avatar"
        )
        .populate("replyTo")
        .sort({
          createdAt: 1,
        });

    return res.status(200).json(
      new ApiResponse(
        200,
        messages,
        "Messages fetched"
      )
    );
  }
);

const deleteMessage = asyncHandler(
  async (req, res) => {
    const { messageId } = req.params;

    const message =
      await Message.findById(
        messageId
      );

    if (!message) {
      throw new ApiError(
        404,
        "Message not found"
      );
    }

    if (
      message.sender.toString() !==
      req.user._id.toString()
    ) {
      throw new ApiError(
        403,
        "Unauthorized"
      );
    }

    message.isDeleted = true;

    await message.save();

    const io = getIO();

    io.to(
      message.conversation.toString()
    ).emit(
      "messageDeleted",
      {
        messageId: message._id,
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Message deleted"
      )
    );
  }
);

const markMessageSeen =
  asyncHandler(async (req, res) => {
    const { messageId } =
      req.params;

    const message =
      await Message.findById(
        messageId
      );

    if (!message) {
      throw new ApiError(
        404,
        "Message not found"
      );
    }

    await Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: {
          seenBy: req.user._id,
        },
      }
    );

    const io = getIO();

    io.to(
      message.sender.toString()
    ).emit(
      "messageSeen",
      {
        messageId,
        seenBy: req.user._id,
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Message marked as seen"
      )
    );
  });

export {
  sendMessage,
  getMessages,
  deleteMessage,
  markMessageSeen,
};