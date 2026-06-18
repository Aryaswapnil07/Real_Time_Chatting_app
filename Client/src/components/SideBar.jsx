import React, { useState } from "react";
import { BsChatDotsFill, BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const userDummyData = [
    {
      _id: 1,
      fullName: "Achintya Singh",
      online: true,
    },
    {
      _id: 2,
      fullName: "Zigyasha Kumari",
      online: true,
    },
    {
      _id: 3,
      fullName: "Aman Verma",
      online: true,
    },
    {
      _id: 4,
      fullName: "Newton",
      online: false,
    },
    {
      _id: 5,
      fullName: "Shalini Singh",
      online: false,
    },
    {
      _id: 6,
      fullName: "Navneet Kumar",
      online: false,
    },
  ];

  const filteredUsers = userDummyData.filter((user) =>
    user.fullName.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div
      className={`bg-green-500/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Header */}

      <div className="pb-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BsChatDotsFill className="text-4xl text-green-500" />
            <h1 className="text-2xl font-bold text-green-400">
              ChatApp
            </h1>
          </div>

          <div className="relative py-2 group">
            <BsThreeDotsVertical className="text-2xl cursor-pointer text-green-300 hover:text-green-400 transition" />

            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#1f2937] border border-green-500/30 text-gray-100 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm hover:text-green-400"
              >
                Edit Profile
              </p>

              <hr className="my-2 border-t border-gray-600" />

              <p className="cursor-pointer text-sm hover:text-red-400">
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search */}

        <div className="bg-green-500/20 border border-green-500/30 rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <FiSearch className="text-green-300 text-lg" />

          <input
            type="text"
            placeholder="Search User..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm placeholder-green-200 flex-1"
          />
        </div>
      </div>

      {/* Users */}

      <div className="flex flex-col">
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => setSelectedUser(user)}
            key={index}
            className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer mt-2 transition-all hover:bg-green-500/20 ${
              selectedUser?._id === user._id
                ? "bg-green-500/30"
                : ""
            }`}
          >
            {/* Avatar */}

            <div className="relative">
              <FaUserCircle className="text-4xl text-green-300" />

              {user.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#111827]"></span>
              )}
            </div>

            {/* User Details */}

            <div className="flex flex-col leading-5">
              <p className="font-medium">
                {user.fullName}
              </p>

              {user.online ? (
                <span className="text-green-400 text-xs">
                  Online
                </span>
              ) : (
                <span className="text-neutral-400 text-xs">
                  Offline
                </span>
              )}
            </div>

            {/* Notification */}

            {index > 2 && (
              <p className="absolute top-3 right-3 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-green-500/60">
                {index}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;