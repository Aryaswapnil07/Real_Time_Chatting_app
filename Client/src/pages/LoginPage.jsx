import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsChatDotsFill } from "react-icons/bs";
import { FiImage, FiLogIn, FiUserPlus } from "react-icons/fi";
import { useAuth } from "../context/useAuth";

const initialForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  bio: "",
  identifier: "",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (file && !file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      setAvatarFile(null);
      setAvatarPreview("");
      event.target.value = "";
      return;
    }

    setAvatarFile(file || null);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const resetForm = () => {
    setForm(initialForm);
    setAvatarFile(null);
    setAvatarPreview("");
    setAgree(false);
    setError("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetForm();
  };

  const buildLoginPayload = () => {
    const identifier = form.identifier.trim();

    if (identifier.includes("@")) {
      return {
        email: identifier.toLowerCase(),
        password: form.password,
      };
    }

    return {
      username: identifier.toLowerCase(),
      password: form.password,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!agree) {
          throw new Error("Please accept the terms before creating an account.");
        }

        if (!avatarFile) {
          throw new Error("Please choose an avatar image.");
        }

        const formData = new FormData();
        formData.append("fullName", form.fullName.trim());
        formData.append("username", form.username.trim().toLowerCase());
        formData.append("email", form.email.trim().toLowerCase());
        formData.append("password", form.password);
        formData.append("bio", form.bio.trim());
        formData.append("avatar", avatarFile);

        await register(formData);
        await login({
          username: form.username.trim().toLowerCase(),
          password: form.password,
        });
      } else {
        await login(buildLoginPayload());
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <main className="page-shell page-shell--auth grid min-h-dvh bg-[#071a0d] text-slate-100 lg:grid-cols-[0.9fr_1.1fr]">
      {/* BRANDING SECTION - Hidden on mobile and small tablets */}
      <section className="hidden flex-col justify-between border-r border-white/10 bg-[#0b2412] px-5 py-6 sm:px-6 sm:py-8 md:px-7 md:py-9 lg:flex lg:px-8 lg:py-8 xl:px-12 xl:py-10">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-500 text-xl text-[#071a0d] sm:h-12 sm:w-12 sm:text-2xl">
            <BsChatDotsFill />
          </div>
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">QuickChat</h1>
            <p className="text-xs text-slate-400 sm:text-sm">@real-time</p>
          </div>
        </div>

        {/* Heading and description */}
        <div className="max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-300 sm:text-sm">
            MERN chat
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:mt-4 sm:text-4xl lg:text-5xl">
            Messages, friends, and live presence in one workspace.
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:mt-5 sm:text-base">
            Built against your Express, MongoDB, JWT, and Socket.IO backend.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 sm:gap-3 sm:text-sm">
          <div className="rounded-lg border border-white/10 p-3 sm:p-4">
            <p className="text-green-400">REST</p>
            <p className="mt-1.5 text-slate-400 sm:mt-2">Auth and data</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3 sm:p-4">
            <p className="text-emerald-300">Socket</p>
            <p className="mt-1.5 text-slate-400 sm:mt-2">Live messages</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3 sm:p-4">
            <p className="text-amber-300">JWT</p>
            <p className="mt-1.5 text-slate-400 sm:mt-2">Private routes</p>
          </div>
        </div>
      </section>

      {/* AUTH FORM SECTION - Full width on mobile */}
      <section className="flex min-h-dvh items-center justify-center px-3 py-6 sm:px-4 sm:py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl transition duration-300 sm:rounded-2xl sm:max-w-md sm:p-6 md:p-7"
        >
          {/* Form header */}
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
            <div>
              <p className="text-xs text-slate-400 sm:text-sm">
                {isSignup ? "Create account" : "Welcome back"}
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                {isSignup ? "Sign up" : "Login"}
              </h2>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-500/15 text-lg text-green-400 sm:h-12 sm:w-12 sm:text-xl">
              {isSignup ? <FiUserPlus /> : <FiLogIn />}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 sm:mb-4 sm:text-sm">
              {error}
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-2.5 sm:space-y-3">
            {isSignup ? (
              <>
                {/* Full Name */}
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:px-4 sm:py-3 sm:text-sm"
                  placeholder="Full name"
                  required
                />

                {/* Username */}
                <input
                  value={form.username}
                  onChange={(event) => updateField("username", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:px-4 sm:py-3 sm:text-sm"
                  placeholder="Username"
                  required
                />

                {/* Email */}
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:px-4 sm:py-3 sm:text-sm"
                  placeholder="Email address"
                  required
                />
              </>
            ) : (
              /* Login - Email or username */
              <input
                value={form.identifier}
                onChange={(event) => updateField("identifier", event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:px-4 sm:py-3 sm:text-sm"
                placeholder="Email or username"
                required
              />
            )}

            {/* Password */}
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:px-4 sm:py-3 sm:text-sm"
              placeholder="Password"
              required
              minLength={6}
            />

            {isSignup && (
              <>
                {/* Bio */}
                <textarea
                  value={form.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  className="min-h-20 w-full resize-none rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:min-h-24 sm:px-4 sm:py-3 sm:text-sm"
                  placeholder="Bio"
                />

                {/* Avatar upload */}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-[#071a0d] px-3 py-2 text-xs text-slate-300 transition hover:border-green-400/70 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover sm:h-11 sm:w-11"
                    />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-green-500/15 text-sm text-green-400 sm:h-11 sm:w-11">
                      <FiImage />
                    </span>
                  )}
                  <span className="truncate">{avatarFile ? avatarFile.name : "Choose avatar"}</span>
                </label>

                {/* Terms checkbox */}
                <label className="flex items-start gap-2 text-xs text-slate-400 sm:text-sm">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) => setAgree(event.target.checked)}
                    className="mt-0.5 sm:mt-1"
                  />
                  <span>Agree to the terms of use and privacy policy.</span>
                </label>
              </>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-400 px-3 py-2 text-xs font-semibold text-[#071a0d] transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-5 sm:px-4 sm:py-3 sm:text-sm"
          >
            {isSignup ? <FiUserPlus /> : <FiLogIn />}
            {loading ? "Please wait" : isSignup ? "Create account" : "Login"}
          </button>

          {/* Mode switch link */}
          <div className="mt-4 text-center text-xs text-slate-400 sm:mt-5 sm:text-sm">
            {isSignup ? "Already have an account?" : "New to QuickChat?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? "login" : "signup")}
              className="font-medium text-green-400 hover:text-green-300"
            >
              {isSignup ? "Login" : "Sign up"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
