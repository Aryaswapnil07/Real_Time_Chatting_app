import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  const [name, setName] = useState("Martin Johnson");
  const [bio, setBio] = useState(
    "Hi Everyone, I am using ChatApp 🚀"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log({
      name,
      bio,
      image: selectedImg,
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071a0d] via-[#102414] to-[#16331d] flex items-center justify-center p-4">
      <div className="w-5/6 max-w-3xl backdrop-blur-xl bg-white/10 text-white border border-green-500/30 flex items-center justify-between max-sm:flex-col-reverse rounded-2xl overflow-hidden">

        {/* Left */}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-2xl font-semibold text-green-400">
            Profile Details
          </h3>

          {/* Upload */}

          <label
            htmlFor="avatar"
            className="flex items-center gap-4 cursor-pointer"
          >
            <input
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
              onChange={(e) =>
                setSelectedImg(e.target.files[0])
              }
            />

            {selectedImg ? (
              <img
                src={URL.createObjectURL(selectedImg)}
                alt=""
                className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
              />
            ) : (
              <FaUserCircle className="text-6xl text-green-400" />
            )}

            <p className="text-green-200">
              Upload Profile Image
            </p>
          </label>

          {/* Name */}

          <input
            type="text"
            required
            placeholder="Your Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="p-3 rounded-lg bg-white/10 border border-green-500/30 outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Bio */}

          <textarea
            rows={4}
            required
            placeholder="Write profile bio"
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            className="p-3 rounded-lg bg-white/10 border border-green-500/30 outline-none resize-none focus:ring-2 focus:ring-green-500"
          />

          {/* Buttons */}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 transition p-3 rounded-full text-lg font-medium"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 border border-green-500 text-green-400 hover:bg-green-500/20 transition p-3 rounded-full text-lg"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Right */}

        <div className="flex items-center justify-center p-10">
          {selectedImg ? (
            <img
              src={URL.createObjectURL(selectedImg)}
              alt=""
              className="max-w-44 aspect-square rounded-full object-cover border-4 border-green-500"
            />
          ) : (
            <FaUserCircle className="text-[180px] text-green-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;