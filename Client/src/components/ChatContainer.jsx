import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { IoArrowBack, IoSend } from "react-icons/io5";
import { BiHelpCircle } from "react-icons/bi";
import { BsChatDotsFill } from "react-icons/bs";
import { FiImage } from "react-icons/fi";

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const messagesDummyData = [
    {
      senderId: "me",
      text: "Hey! How are you?",
      createdAt: "10:30 AM",
    },
    {
      senderId: "user",
      text: "I'm good. What about you?",
      createdAt: "10:31 AM",
    },
    {
      senderId: "me",
      text: "Doing great! Working on my MERN Chat App 🚀",
      createdAt: "10:32 AM",
    },
    {
      senderId: "user",
      text: "Awesome! Keep coding 😄",
      createdAt: "10:33 AM",
    },
  ];

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}

      <div className="flex items-center gap-3 py-3 px-4 border-b border-green-500/30">
        <FaUserCircle className="text-3xl text-green-400" />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}

          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </p>

        <IoArrowBack
          onClick={() => setSelectedUser(null)}
          className="md:hidden text-2xl cursor-pointer text-green-400"
        />

        <BiHelpCircle className="hidden md:block text-2xl cursor-pointer text-green-400" />
      </div>

      {/* Chat Area */}

      <div className="flex flex-col h-[calc(100%-140px)] overflow-y-scroll p-3 pb-6">
        {messagesDummyData.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== "me" && "flex-row-reverse"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-[220px] md:text-sm font-light rounded-lg mb-8 break-all text-white ${
                  msg.senderId === "me"
                    ? "bg-green-500/30 rounded-br-none"
                    : "bg-green-700/30 rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}

            <div className="text-center text-xs">
              <FaUserCircle className="w-7 h-7 text-green-400 mx-auto" />

              <p className="text-gray-400">
                {msg.createdAt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Area */}

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-[#111827]/80 backdrop-blur-sm">
        <div className="flex-1 flex items-center bg-green-500/20 border border-green-500/30 px-3 rounded-full">
          <input
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none bg-transparent text-white placeholder-green-200"
          />

          <input
            type="file"
            id="image"
            accept="image/png,image/jpeg,image/jpg"
            hidden
          />

          <label htmlFor="image">
            <FiImage className="text-2xl text-green-400 mr-2 cursor-pointer hover:text-green-300 transition" />
          </label>
        </div>

        <button className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 transition flex justify-center items-center">
          <IoSend className="text-xl text-white" />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-3 text-gray-400 bg-green-500/10 max-md:hidden">
      <BsChatDotsFill className="text-7xl text-green-500" />

      <p className="text-2xl font-semibold text-white">
        Chat Anytime, Anywhere
      </p>

      <p className="text-green-200">
        Select a conversation and start messaging.
      </p>
    </div>
  );
};

export default ChatContainer;