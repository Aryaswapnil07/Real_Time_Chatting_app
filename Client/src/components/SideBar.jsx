import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiLogOut,
  FiMessageCircle,
  FiSearch,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
import UserAvatar from "./UserAvatar";
import {
  formatLastSeen,
  formatMessageTime,
  getConversationPeer,
} from "../utils/chat";

const SideBar = ({
  currentUser,
  conversations,
  selectedConversation,
  pendingRequests,
  friends,
  unreadNotifications,
  loading,
  searchUsers,
  onSelectConversation,
  onStartConversation,
  onSendFriendRequest,
  onAcceptRequest,
  onRejectRequest,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const friendIds = useMemo(
    () => new Set(friends.map((friend) => friend._id)),
    [friends],
  );

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return undefined;
    }

    let ignore = false;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setSearchError("");

      searchUsers(trimmedQuery)
        .then((users) => {
          if (!ignore) {
            setSearchResults(users);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setSearchError(err.message || "Search failed");
          }
        })
        .finally(() => {
          if (!ignore) {
            setSearching(false);
          }
        });
    }, 300);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [query, searchUsers]);

  const hasSearch = query.trim().length >= 2;

  return (
    <aside
      className={`flex h-full min-h-0 flex-col border-r border-white/10 bg-[#0b2412] ${
        selectedConversation ? "max-lg:hidden" : ""
      }`}
    >
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-400 text-[#071a0d]">
              <FiMessageCircle />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">QuickChat</h1>
              <p className="truncate text-xs text-slate-400">
                {currentUser?.username ? `@${currentUser.username}` : "Online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Edit profile"
            >
              <FiUser />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-red-500/15 hover:text-red-200"
              title="Logout"
            >
              <FiLogOut />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2">
          <FiSearch className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
            placeholder="Search people"
          />
        </div>

        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-green-200/75 transition hover:bg-green-500/10 hover:text-green-100"
        >
          <FiBell className="text-amber-300" />
          <span>{unreadNotifications} unread notifications</span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {hasSearch ? (
          <div className="space-y-2">
            {searching && (
              <p className="px-2 py-6 text-center text-sm text-slate-400">
                Searching...
              </p>
            )}

            {searchError && (
              <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {searchError}
              </p>
            )}

            {!searching &&
              searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <UserAvatar user={user} showStatus />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.fullName}</p>
                    <p className="truncate text-xs text-slate-400">
                      @{user.username}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartConversation(user._id)}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-green-400 text-[#071a0d] transition hover:bg-green-300"
                    title="Open chat"
                  >
                    <FiMessageCircle />
                  </button>

                  {!friendIds.has(user._id) && (
                    <button
                      type="button"
                      onClick={() => onSendFriendRequest(user._id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-200 transition hover:border-emerald-300/60 hover:text-emerald-200"
                      title="Send friend request"
                    >
                      <FiUserPlus />
                    </button>
                  )}
                </div>
              ))}

            {!searching && !searchResults.length && !searchError && (
              <p className="px-2 py-6 text-center text-sm text-slate-400">
                No users found
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {pendingRequests.length > 0 && (
              <section>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase text-slate-500">
                    Requests
                  </h2>
                  <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-xs text-amber-200">
                    {pendingRequests.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar user={request.sender} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {request.sender?.fullName}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            @{request.sender?.username}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onAcceptRequest(request._id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-3 py-2 text-sm font-medium text-[#071a0d]"
                        >
                          <FiCheck />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectRequest(request._id)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10"
                          title="Reject"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {friends.length > 0 && (
              <section>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase text-green-200/50">
                    <FiUsers />
                    Browse friends
                  </h2>
                  <span className="text-xs text-green-200/50">
                    {friends.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-3 rounded-lg border border-green-500/10 bg-green-500/5 p-3"
                    >
                      <UserAvatar user={friend} showStatus />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {friend.fullName}
                        </p>
                        <p className="truncate text-xs text-green-200/55">
                          {friend.isOnline
                            ? "Online"
                            : formatLastSeen(friend.lastSeen)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onStartConversation(friend._id)}
                        className="grid h-9 w-9 place-items-center rounded-lg bg-green-500 text-[#071a0d] transition hover:bg-green-400"
                        title="Chat with friend"
                      >
                        <FiMessageCircle />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase text-slate-500">
                  Chats
                </h2>
                <span className="text-xs text-slate-500">
                  {conversations.length}
                </span>
              </div>

              {loading ? (
                <p className="px-2 py-6 text-center text-sm text-slate-400">
                  Loading chats...
                </p>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => {
                    const peer = getConversationPeer(conversation, currentUser);
                    const isSelected =
                      selectedConversation?._id === conversation._id;
                    const lastMessage = conversation.lastMessage;
                    const lastText =
                      lastMessage?.text ||
                      (lastMessage?.image ? "Image" : "No messages yet");

                    return (
                      <button
                        type="button"
                        key={conversation._id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                          isSelected
                            ? "bg-green-500/15"
                            : "hover:bg-white/[0.06]"
                        }`}
                      >
                        <UserAvatar user={peer} showStatus />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">
                              {peer?.fullName || "Unknown user"}
                            </p>
                            <span className="shrink-0 text-[11px] text-slate-500">
                              {formatMessageTime(
                                lastMessage?.createdAt || conversation.updatedAt,
                              )}
                            </span>
                          </div>
                          <p className="truncate text-xs text-slate-400">
                            {peer?.isOnline ? "Online" : formatLastSeen(peer?.lastSeen)}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {lastText}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {!conversations.length && (
                    <p className="px-2 py-6 text-center text-sm text-slate-400">
                      Search people to start a chat
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
