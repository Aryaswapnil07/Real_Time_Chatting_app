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
    <main className="page-shell page-shell--notifications min-h-dvh bg-[#071a0d] p-2 text-green-50 sm:p-3 md:p-4 lg:p-5">
      <div className="mx-auto w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
        {/* HEADER - Responsive */}
        <header className="mb-4 flex flex-col gap-3 rounded-xl border border-green-500/20 bg-[#0b2412]/95 p-3 shadow-2xl shadow-black/25 backdrop-blur-xl sm:rounded-2xl sm:mb-5 sm:p-4 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="grid h-9 w-9 place-items-center rounded-lg text-green-200 transition hover:bg-green-500/10 sm:h-10 sm:w-10"
              title="Back to chats"
            >
              <FiArrowLeft className="text-base sm:text-lg" />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-500 text-lg text-[#071a0d] sm:h-11 sm:w-11 sm:text-xl">
              <FiBell />
            </div>
            <div>
              <h1 className="text-lg font-semibold sm:text-2xl">Notifications</h1>
              <p className="text-xs text-green-200/70 sm:text-sm">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={!unreadCount || actionId === "all"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-[#071a0d] transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-4 sm:text-sm"
          >
            <FiCheckCircle className="text-base sm:text-lg" />
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">Mark read</span>
          </button>
        </header>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100 sm:mb-4 sm:px-4 sm:py-3 sm:text-sm">
            {error}
          </div>
        )}

        {/* TABS - Responsive */}
        <div className="mb-3 inline-flex rounded-lg border border-green-500/20 bg-[#0b2412] p-1 sm:mb-4">
          {["unread", "all"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition sm:px-4 sm:py-2 sm:text-sm ${
                activeTab === tab
                  ? "bg-green-500 text-[#071a0d]"
                  : "text-green-200 hover:bg-green-500/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* NOTIFICATIONS LIST - Responsive */}
        <section className="overflow-hidden rounded-xl border border-green-500/20 bg-[#0b2412]/95 backdrop-blur-xl sm:rounded-2xl">
          {loading ? (
            <div className="grid min-h-48 place-items-center sm:min-h-64">
              <div className="h-8 w-8 rounded-full border-2 border-green-400/25 border-t-green-400 animate-spin sm:h-10 sm:w-10" />
            </div>
          ) : (
            <div className="divide-y divide-green-500/10">
              {visibleNotifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`flex flex-col gap-2 p-3 sm:gap-3 sm:p-4 md:flex-row md:items-center md:gap-4 ${
                    notification.isRead ? "bg-transparent" : "bg-green-500/5"
                  }`}
                >
                  <UserAvatar user={notification.sender} showStatus />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-green-50 sm:text-base">
                        {notification.sender?.fullName || "QuickChat"}
                      </p>
                      {!notification.isRead && (
                        <span className="rounded-full bg-lime-300/15 px-1.5 py-0.5 text-xs text-lime-200">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-green-100/80 sm:mt-1 sm:text-sm sm:leading-6">
                      {notification.content || "You have a new notification."}
                    </p>
                    <p className="mt-0.5 text-xs text-green-200/50 sm:mt-1">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* ACTIONS - Responsive button group */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => openChat(notification)}
                      disabled={actionId === notification._id}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-green-500 text-[#071a0d] transition hover:bg-green-400 disabled:opacity-60 sm:h-10 sm:w-10"
                      title="Open chat"
                    >
                      <FiMessageCircle className="text-base sm:text-lg" />
                    </button>
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => markRead(notification._id)}
                        disabled={actionId === notification._id}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-green-500/20 text-green-200 transition hover:bg-green-500/10 disabled:opacity-60 sm:h-10 sm:w-10"
                        title="Mark read"
                      >
                        <FiCheckCircle className="text-base sm:text-lg" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(notification._id)}
                      disabled={actionId === notification._id}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-red-400/20 text-red-200 transition hover:bg-red-500/10 disabled:opacity-60 sm:h-10 sm:w-10"
                      title="Delete"
                    >
                      <FiTrash2 className="text-base sm:text-lg" />
                    </button>
                  </div>
                </article>
              ))}

              {!visibleNotifications.length && (
                <div className="grid min-h-48 place-items-center px-3 text-center text-xs text-green-200/60 sm:min-h-64 sm:px-4 sm:text-sm">
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