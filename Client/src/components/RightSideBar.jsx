import { FiLogOut, FiTrash2 } from "react-icons/fi";
import UserAvatar from "./UserAvatar";
import { formatLastSeen } from "../utils/chat";

const RightSideBar = ({
  selectedPeer,
  friends,
  messages,
  onRemoveFriend,
  onLogout,
}) => {
  if (!selectedPeer) {
    return null;
  }

  const isFriend = friends.some((friend) => friend._id === selectedPeer._id);
  const media = messages.filter((message) => message.image).slice(-12).reverse();

  return (
    <aside className="hidden h-full min-h-0 flex-col border-l border-white/10 bg-[#0b2412] lg:flex">
      <div className="border-b border-white/10 p-5 text-center">
        <div className="flex justify-center">
          <UserAvatar user={selectedPeer} size="lg" showStatus />
        </div>
        <h2 className="mt-4 truncate text-xl font-semibold">
          {selectedPeer.fullName}
        </h2>
        <p className="truncate text-sm text-slate-400">@{selectedPeer.username}</p>
        <p className="mt-2 text-sm text-slate-400">
          {selectedPeer.isOnline ? "Online" : formatLastSeen(selectedPeer.lastSeen)}
        </p>
        {selectedPeer.bio && (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-slate-300">
            {selectedPeer.bio}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase text-slate-500">Media</h3>
          <span className="text-xs text-slate-500">{media.length}</span>
        </div>

        {media.length ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {media.map((message) => (
              <a
                key={message._id}
                href={message.image}
                target="_blank"
                rel="noreferrer"
                className="aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
              >
                <img
                  src={message.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-slate-400">No media</p>
        )}
      </div>

      <div className="space-y-2 border-t border-white/10 p-4">
        {isFriend && (
          <button
            type="button"
            onClick={() => onRemoveFriend(selectedPeer._id)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/25 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/10"
          >
            <FiTrash2 />
            Remove friend
          </button>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/15"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default RightSideBar;
