import { useState } from "react";
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
    setAvatarFile(file || null);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  };

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
        email: identifier,
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
      <section className="hidden flex-col justify-between border-r border-white/10 bg-[#0b2412] px-8 py-8 lg:flex xl:px-12 xl:py-10">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-green-500 text-[#071a0d]">
            <BsChatDotsFill className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">QuickChat</h1>
            <p className="text-sm text-slate-400">@real-time</p>
          </div>
        </div>

        <div className="max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-300">
            MERN chat
          </p>
          <h2 className="mt-4 text-5xl font-semibold leading-tight">
            Messages, friends, and live presence in one workspace.
          </h2>
          <p className="mt-5 text-base text-slate-400">
            Built against your Express, MongoDB, JWT, and Socket.IO backend.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-green-400">REST</p>
            <p className="mt-2 text-slate-400">Auth and data</p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-emerald-300">Socket</p>
            <p className="mt-2 text-slate-400">Live messages</p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-amber-300">JWT</p>
            <p className="mt-2 text-slate-400">Private routes</p>
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl transition duration-300 md:p-7"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">
                {isSignup ? "Create account" : "Welcome back"}
              </p>
              <h2 className="text-3xl font-semibold">
                {isSignup ? "Sign up" : "Login"}
              </h2>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-lg bg-green-500/15 text-green-400">
              {isSignup ? <FiUserPlus /> : <FiLogIn />}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {isSignup ? (
              <>
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
                  placeholder="Full name"
                  required
                />
                <input
                  value={form.username}
                  onChange={(event) => updateField("username", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
                  placeholder="Username"
                  required
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
                  placeholder="Email address"
                  required
                />
              </>
            ) : (
              <input
                value={form.identifier}
                onChange={(event) => updateField("identifier", event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
                placeholder="Email or username"
                required
              />
            )}

            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
              placeholder="Password"
              required
              minLength={6}
            />

            {isSignup && (
              <>
                <textarea
                  value={form.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
                  placeholder="Bio"
                />

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/15 bg-[#071a0d] px-4 py-3 text-sm text-slate-300 transition hover:border-green-400/70">
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
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-green-500/15 text-green-400">
                      <FiImage />
                    </span>
                  )}
                  <span>{avatarFile ? avatarFile.name : "Choose avatar"}</span>
                </label>

                <label className="flex items-start gap-3 text-sm text-slate-400">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) => setAgree(event.target.checked)}
                    className="mt-1"
                  />
                  <span>Agree to the terms of use and privacy policy.</span>
                </label>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-400 px-4 py-3 font-semibold text-[#071a0d] transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSignup ? <FiUserPlus /> : <FiLogIn />}
            {loading ? "Please wait" : isSignup ? "Create account" : "Login"}
          </button>

          <div className="mt-5 text-center text-sm text-slate-400">
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
