import React from "react";
import { FaUserCircle } from "react-icons/fa";

const RightSidebar = ({ selectedUser }) => {
  const imagesDummyData = [
    "https://picsum.photos/200?random=1",
    "https://picsum.photos/200?random=2",
    "https://picsum.photos/200?random=3",
    "https://picsum.photos/200?random=4",
    "https://picsum.photos/200?random=5",
    "https://picsum.photos/200?random=6",
  ];

  return (
    selectedUser && (
      <div
        className={`bg-green-500/10 text-white w-full relative overflow-y-scroll ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          {/* Profile */}

          <div className="relative">
            <FaUserCircle className="text-8xl text-green-400" />

            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#111827]"></span>
          </div>

          {/* Name */}

          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>

            {selectedUser.fullName}
          </h1>

          {/* Bio */}

          <p className="px-10 mx-auto text-center text-green-100">
            {selectedUser.bio ||
              "Available for chatting anytime 🚀"}
          </p>
        </div>

        {/* Divider */}

        <hr className="border-[#ffffff50] my-4" />

        {/* Media */}

        <div className="px-5 text-xs">
          <p>Media</p>

          <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {imagesDummyData.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)}
                className="cursor-pointer rounded"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full rounded-md"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}

        <div className="flex justify-center">
          <button className="mt-8 mb-6 bg-red-500 hover:bg-red-600 transition px-8 py-3 rounded-full text-sm font-medium">
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default RightSidebar;