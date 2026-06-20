import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBell,
  FiCheckCircle,
  FiMessageCircle,
  FiTrash2,
} from "react-icons/fi";
import { conversationsApi } from "../api/conversations";
import { notificationsApi } from "../api/notifications";
import UserAvatar from "../components/UserAvatar";

const formatNotificationTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("unread");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (err) {
      setError(err.message || "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadNotifications();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const visibleNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications;
  }, [activeTab, notifications]);

  const markRead = async (notificationId) => {
    setActionId(notificationId);
    setError("");

    try {
      await notificationsApi.markRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to mark notification read");
    } finally {
      setActionId("");
    }
  };

  const markAllRead = async () => {
    setActionId("all");
    setError("");

    try {
      await notificationsApi.markAllRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (err) {
      setError(err.message || "Unable to mark notifications read");
    } finally {
      setActionId("");
    }
  };

  const deleteNotification = async (notificationId) => {
    setActionId(notificationId);
    setError("");

    try {
      await notificationsApi.delete(notificationId);
      setNotifications((current) =>
        current.filter((notification) => notification._id !== notificationId),
      );
    } catch (err) {
      setError(err.message || "Unable to delete notification");
    } finally {
      setActionId("");
    }
  };

  const openChat = async (notification) => {
    setActionId(notification._id);
    setError("");

    try {
      let conversationId = notification.conversation?._id;

      if (!conversationId && notification.sender?._id) {
        const conversation = await conversationsApi.create(notification.sender._id);
        conversationId = conversation._id;
      }

      if (!notification.isRead) {
        await notificationsApi.markRead(notification._id);
      }

      if (conversationId) {
        navigate(`/?conversation=${conversationId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Unable to open chat");
    } finally {
      setActionId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#071a0d] p-4 text-green-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-500/20 bg-[#0b2412] p-4 shadow-2xl shadow-black/25">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="grid h-10 w-10 place-items-center rounded-lg text-green-200 transition hover:bg-green-500/10"
              title="Back to chats"
            >
              <FiArrowLeft />
            </button>
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-green-500 text-[#071a0d]">
              <FiBell />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Notifications</h1>
              <p className="text-sm text-green-200/70">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={!unreadCount || actionId === "all"}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-[#071a0d] transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheckCircle />
            Mark all read
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="mb-4 inline-flex rounded-lg border border-green-500/20 bg-[#0b2412] p-1">
          {["unread", "all"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-green-500 text-[#071a0d]"
                  : "text-green-200 hover:bg-green-500/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="overflow-hidden rounded-lg border border-green-500/20 bg-[#0b2412]">
          {loading ? (
            <div className="grid min-h-64 place-items-center">
              <div className="h-10 w-10 rounded-full border-2 border-green-400/25 border-t-green-400 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-green-500/10">
              {visibleNotifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`flex flex-col gap-3 p-4 md:flex-row md:items-center ${
                    notification.isRead ? "bg-transparent" : "bg-green-500/5"
                  }`}
                >
                  <UserAvatar user={notification.sender} showStatus />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-green-50">
                        {notification.sender?.fullName || "QuickChat"}
                      </p>
                      {!notification.isRead && (
                        <span className="rounded-full bg-lime-300/15 px-2 py-0.5 text-xs text-lime-200">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-green-100/80">
                      {notification.content || "You have a new notification."}
                    </p>
                    <p className="mt-1 text-xs text-green-200/50">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openChat(notification)}
                      disabled={actionId === notification._id}
                      className="grid h-10 w-10 place-items-center rounded-lg bg-green-500 text-[#071a0d] transition hover:bg-green-400 disabled:opacity-60"
                      title="Open chat"
                    >
                      <FiMessageCircle />
                    </button>
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => markRead(notification._id)}
                        disabled={actionId === notification._id}
                        className="grid h-10 w-10 place-items-center rounded-lg border border-green-500/20 text-green-200 transition hover:bg-green-500/10 disabled:opacity-60"
                        title="Mark read"
                      >
                        <FiCheckCircle />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(notification._id)}
                      disabled={actionId === notification._id}
                      className="grid h-10 w-10 place-items-center rounded-lg border border-red-400/20 text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </article>
              ))}

              {!visibleNotifications.length && (
                <div className="grid min-h-64 place-items-center px-4 text-center text-sm text-green-200/60">
                  No notifications here
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default NotificationsPage;
