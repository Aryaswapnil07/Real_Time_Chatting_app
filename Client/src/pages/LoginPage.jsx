import React, { useState } from "react";
import { BsChatDotsFill } from "react-icons/bs";
import { IoArrowForward, IoArrowBack } from "react-icons/io5";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [agree, setAgree] = useState(false);

  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const clearForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
    setAgree(false);
    setIsDataSubmitted(false);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();

    if (!agree) {
      alert("Please accept Terms & Privacy Policy");
      return;
    }

    // Signup Step 1
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    // Signup Complete
    if (currState === "Sign up") {
      console.log("Creating Account");

      console.log({
        fullName,
        email,
        password,
        bio,
      });

      alert("Account Created Successfully!");

      clearForm();
      return;
    }

    // Login

    console.log("Logging In");

    console.log({
      email,
      password,
    });

    alert("Login Successful!");

    clearForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071a0d] via-[#102414] to-[#16331d] flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col p-4">
      {/* Left */}

      <div className="flex flex-col items-center gap-4">
        <BsChatDotsFill className="text-[120px] text-green-500" />

        <h1 className="text-5xl font-bold text-green-400">
          ChatApp
        </h1>

        <p className="text-green-200 text-center">
          Chat Anytime, Anywhere 🚀
        </p>
      </div>

      {/* Right */}

      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/10 backdrop-blur-lg text-white border-green-500/30 p-6 flex flex-col gap-5 rounded-2xl shadow-lg w-full max-w-md"
      >
        {/* Header */}

        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}

          <IoArrowForward className="text-green-400 text-2xl" />
        </h2>

        {/* Full Name */}

        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            required
            className="p-3 rounded-lg bg-white/10 border border-green-500/30 outline-none focus:ring-2 focus:ring-green-500 placeholder-green-200"
          />
        )}

        {/* Email & Password */}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="p-3 rounded-lg bg-white/10 border border-green-500/30 outline-none focus:ring-2 focus:ring-green-500 placeholder-green-200"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="p-3 rounded-lg bg-white/10 border border-green-500/30 outline-none focus:ring-2 focus:ring-green-500 placeholder-green-200"
            />
          </>
        )}

        {/* Bio */}

        {currState === "Sign up" && isDataSubmitted && (
          <>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Provide a short bio..."
              required
              className="p-3 rounded-lg bg-white/10 border border-green-500/30 outline-none focus:ring-2 focus:ring-green-500 placeholder-green-200 resize-none"
            />

            {/* Back Button */}

            <button
              type="button"
              onClick={() => setIsDataSubmitted(false)}
              className="flex items-center justify-center gap-2 py-3 border border-green-500 text-green-400 rounded-lg hover:bg-green-500/20 transition"
            >
              <IoArrowBack />
              Back
            </button>
          </>
        )}

        {/* Submit */}

        <button
          type="submit"
          className="py-3 bg-green-500 hover:bg-green-600 rounded-lg transition font-semibold"
        >
          {currState === "Sign up"
            ? isDataSubmitted
              ? "Create Account"
              : "Next"
            : "Login Now"}
        </button>

        {/* Terms */}

        <div className="flex items-center gap-2 text-sm text-green-100">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />

          <p>Agree to the Terms of Use & Privacy Policy.</p>
        </div>

        {/* Switch Login/Signup */}

        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-green-100">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                  setBio("");
                }}
                className="font-medium text-green-400 cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-green-100">
              Create an account{" "}
              <span
                onClick={() => {
                  setCurrState("Sign up");
                  setIsDataSubmitted(false);
                  setBio("");
                }}
                className="font-medium text-green-400 cursor-pointer hover:underline"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;