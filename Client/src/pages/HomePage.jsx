import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import ChatContainer from "../components/ChatContainer";
import RightSideBar from "../components/RightSideBar";
import { conversationsApi } from "../api/conversations";
import { friendsApi } from "../api/friends";
import { messagesApi } from "../api/messages";
import { notificationsApi } from "../api/notifications";
import { usersApi } from "../api/users";
import { useAuth } from "../context/useAuth";
import { socket } from "../socket/socket";
import {
  getConversationPeer,
  getId,
  mergeById,
  messageBelongsToConversation,
} from "../utils/chat";

const HomePage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedPeer = useMemo(
    () => getConversationPeer(selectedConversation, user),
    [selectedConversation, user],
  );

  const showNotice = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }, []);

  const loadWorkspace = useCallback(async () => {
    setLoadingConversations(true);
    setError("");

    const [conversationResult, pendingResult, friendsResult, unreadResult] =
      await Promise.allSettled([
        conversationsApi.getMine(),
        friendsApi.getPendingRequests(),
        friendsApi.getFriends(),
        notificationsApi.getUnreadCount(),
      ]);

    if (conversationResult.status === "rejected") {
      setError(conversationResult.reason?.message || "Unable to load chats");
    } else {
      setConversations(conversationResult.value);
      setSelectedConversation((current) => {
        if (!current) {
          return null;
        }

        return (
          conversationResult.value.find(
            (conversation) => conversation._id === current._id,
          ) || current
        );
      });
    }

    setPendingRequests(
      pendingResult.status === "fulfilled" ? pendingResult.value : [],
    );
    setFriends(friendsResult.status === "fulfilled" ? friendsResult.value : []);
    setUnreadNotifications(
      unreadResult.status === "fulfilled"
        ? unreadResult.value?.unreadCount || 0
        : 0,
    );
    setLoadingConversations(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWorkspace();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadWorkspace]);

  useEffect(() => {
    const conversationId = new URLSearchParams(location.search).get(
      "conversation",
    );

    if (!conversationId) {
      return undefined;
    }

    let ignore = false;
    const timer = window.setTimeout(() => {
      conversationsApi
        .getById(conversationId)
        .then((conversation) => {
          if (ignore) {
            return;
          }

          setConversations((current) => [
            conversation,
            ...current.filter((item) => item._id !== conversation._id),
          ]);
          setSelectedConversation(conversation);
          navigate("/", { replace: true });
        })
        .catch((err) => {
          if (!ignore) {
            setError(err.message || "Unable to open conversation");
          }
        });
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [location.search, navigate]);

  useEffect(() => {
    if (!selectedConversation?._id) {
      return;
    }

    let ignore = false;
    const timer = window.setTimeout(() => {
      setLoadingMessages(true);
      setError("");

      messagesApi
        .getByConversation(selectedConversation._id)
        .then((conversationMessages) => {
          if (!ignore) {
            setMessages(conversationMessages);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err.message || "Unable to load messages");
          }
        })
        .finally(() => {
          if (!ignore) {
            setLoadingMessages(false);
          }
        });
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [selectedConversation?._id]);

  const updateConversationLastMessage = useCallback((message) => {
    setConversations((current) => {
      const conversationId = getId(message.conversation);
      const next = current.map((conversation) => {
        if (conversation._id !== conversationId) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: message,
          updatedAt: message.createdAt,
        };
      });

      const updatedConversation = next.find(
        (conversation) => conversation._id === conversationId,
      );

      if (!updatedConversation) {
        return next;
      }

      return [
        updatedConversation,
        ...next.filter((conversation) => conversation._id !== conversationId),
      ];
    });
  }, []);

  useEffect(() => {
    const handleNewMessage = (message) => {
      const conversationFound = conversations.some(
        (conversation) => conversation._id === getId(message.conversation),
      );

      updateConversationLastMessage(message);

      if (!conversationFound) {
        loadWorkspace();
      }

      if (messageBelongsToConversation(message, selectedConversation?._id)) {
        setMessages((current) => mergeById(current, message));
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((current) =>
        current.filter((message) => message._id !== messageId),
      );
    };

    const handleMessageSeen = ({ messageId, seenBy }) => {
      setMessages((current) =>
        current.map((message) => {
          if (message._id !== messageId) {
            return message;
          }

          return {
            ...message,
            seenBy: [...new Set([...(message.seenBy || []), seenBy])],
          };
        }),
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [
    conversations,
    loadWorkspace,
    selectedConversation?._id,
    updateConversationLastMessage,
  ]);

  const handleStartConversation = async (participantId) => {
    setError("");

    try {
      const conversation = await conversationsApi.create(participantId);
      const hydratedConversation = await conversationsApi.getById(
        conversation._id,
      );

      setConversations((current) => [
        hydratedConversation,
        ...current.filter((item) => item._id !== hydratedConversation._id),
      ]);
      setSelectedConversation(hydratedConversation);
      showNotice("Conversation opened");
    } catch (err) {
      setError(err.message || "Unable to open conversation");
    }
  };

  const handleSendFriendRequest = async (receiverId) => {
    setError("");

    try {
      await friendsApi.sendRequest(receiverId);
      showNotice("Friend request sent");
    } catch (err) {
      setError(err.message || "Unable to send request");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setError("");

    try {
      await friendsApi.acceptRequest(requestId);
      await loadWorkspace();
      showNotice("Friend request accepted");
    } catch (err) {
      setError(err.message || "Unable to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    setError("");

    try {
      await friendsApi.rejectRequest(requestId);
      setPendingRequests((current) =>
        current.filter((request) => request._id !== requestId),
      );
      showNotice("Friend request rejected");
    } catch (err) {
      setError(err.message || "Unable to reject request");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setError("");

    try {
      await friendsApi.removeFriend(friendId);
      setFriends((current) => current.filter((friend) => friend._id !== friendId));
      showNotice("Friend removed");
    } catch (err) {
      setError(err.message || "Unable to remove friend");
    }
  };

  const handleSendMessage = async ({ text, image }) => {
    if (!selectedConversation?._id || (!text?.trim() && !image?.trim())) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const sentMessage = await messagesApi.send({
        conversationId: selectedConversation._id,
        text: text.trim(),
        image: image.trim(),
      });

      setMessages((current) => mergeById(current, sentMessage));
      updateConversationLastMessage(sentMessage);
    } catch (err) {
      setError(err.message || "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    setError("");

    try {
      await messagesApi.delete(messageId);
      setMessages((current) =>
        current.filter((message) => message._id !== messageId),
      );
      showNotice("Message deleted");
    } catch (err) {
      setError(err.message || "Unable to delete message");
    }
  };

  return (
    <main className="page-shell page-shell--home min-h-dvh bg-[#071a0d] p-2 text-slate-100 sm:p-3 md:p-4 lg:p-5">
      <div
        className={`mx-auto grid h-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b2412]/95 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-2xl sm:max-w-[95vw] md:max-w-[97vw] lg:max-w-[1500px] ${
          selectedConversation
            ? "grid-cols-1 sm:grid-cols-[1fr] lg:grid-cols-[280px_minmax(0,1fr)_280px] xl:grid-cols-[340px_minmax(0,1fr)_310px]"
            : "grid-cols-1 sm:grid-cols-[280px_minmax(0,1fr)] md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]"
        }`}
      >
        {/* SIDEBAR - Hidden on mobile when chat selected */}
        <div className={`${selectedConversation ? "hidden sm:block" : "block"}`}>
          <SideBar
            currentUser={user}
            conversations={conversations}
            selectedConversation={selectedConversation}
            pendingRequests={pendingRequests}
            friends={friends}
            unreadNotifications={unreadNotifications}
            loading={loadingConversations}
            searchUsers={usersApi.search}
            onSelectConversation={setSelectedConversation}
            onStartConversation={handleStartConversation}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onLogout={logout}
          />
        </div>

        {/* CHAT CONTAINER - Full width on mobile when selected */}
        <ChatContainer
          currentUser={user}
          selectedConversation={selectedConversation}
          selectedPeer={selectedPeer}
          messages={messages}
          loading={loadingMessages}
          sending={sending}
          onBack={() => setSelectedConversation(null)}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
        />

        {/* RIGHT SIDEBAR - Hidden on mobile and tablet, visible on desktop when chat selected */}
        <div className={`${selectedConversation ? "hidden lg:block" : "hidden"}`}>
          <RightSideBar
            currentUser={user}
            selectedConversation={selectedConversation}
            selectedPeer={selectedPeer}
            friends={friends}
            messages={messages}
            onRemoveFriend={handleRemoveFriend}
            onLogout={logout}
          />
        </div>
      </div>

      {/* TOAST NOTIFICATIONS - Responsive positioning */}
      {(error || notice) && (
        <div
          className={`fixed right-2 top-2 z-50 max-w-sm rounded-lg border px-3 py-2 text-xs shadow-xl sm:right-4 sm:top-4 sm:px-4 sm:py-3 sm:text-sm ${
            error
              ? "border-red-400/30 bg-red-500/15 text-red-100"
              : "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
          }`}
        >
          {error || notice}
        </div>
      )}
    </main>
  );
};

export default HomePage;