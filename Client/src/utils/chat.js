export const getId = (item) => item?._id || item?.id || item;

export const getConversationPeer = (conversation, currentUser) => {
  if (!conversation || !currentUser) {
    return null;
  }

  if (conversation.isGroup) {
    return {
      _id: conversation._id,
      fullName: conversation.groupName || "Group chat",
      username: "group",
      avatar: conversation.groupAvatar,
      isOnline: false,
      bio: "",
    };
  }

  return conversation.participants?.find(
    (participant) => getId(participant) !== getId(currentUser),
  );
};

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

export const formatMessageTime = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const formatLastSeen = (dateValue) => {
  if (!dateValue) {
    return "Offline";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Offline";
  }

  return `Last seen ${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)}`;
};

export const messageBelongsToConversation = (message, conversationId) =>
  getId(message?.conversation) === conversationId;

export const mergeById = (items, nextItem) => {
  if (!nextItem?._id) {
    return items;
  }

  if (items.some((item) => item._id === nextItem._id)) {
    return items;
  }

  return [...items, nextItem];
};
