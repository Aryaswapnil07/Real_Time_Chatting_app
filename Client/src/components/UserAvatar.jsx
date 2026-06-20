import { getInitials } from "../utils/chat";

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-20 w-20 text-2xl",
};

const UserAvatar = ({ user, size = "md", showStatus = false }) => {
  const classes = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="relative shrink-0">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt=""
          className={`${classes} rounded-full object-cover ring-1 ring-white/10`}
        />
      ) : (
        <div
          className={`${classes} grid place-items-center rounded-full bg-green-500/15 font-semibold text-green-300 ring-1 ring-white/10`}
        >
          {getInitials(user?.fullName || user?.username)}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0b2412] ${
            user?.isOnline ? "bg-emerald-400" : "bg-slate-500"
          }`}
        />
      )}
    </div>
  );
};

export default UserAvatar;
