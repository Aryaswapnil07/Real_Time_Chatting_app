import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiImage, FiSave } from "react-icons/fi";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../context/useAuth";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        bio: form.bio.trim(),
        avatarFile,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-shell page-shell--profile min-h-dvh bg-[#071a0d] p-3 text-slate-100 sm:p-4">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-5xl items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="grid w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b2412]/95 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1fr_340px]"
        >
          <section className="p-5 md:p-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-8 flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-100"
            >
              <FiArrowLeft />
              Back to chats
            </button>

            <div className="mb-6">
              <p className="text-sm text-slate-400">@{user?.username}</p>
              <h1 className="text-3xl font-semibold">Profile</h1>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Full name</span>
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  className="min-h-32 w-full resize-none rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition focus:border-green-400"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/15 bg-[#071a0d] px-4 py-3 text-sm text-slate-300 transition hover:border-green-400/70">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <span className="grid h-11 w-11 place-items-center rounded-full bg-green-500/15 text-green-400">
                  <FiImage />
                </span>
                <span>{avatarFile ? avatarFile.name : "Choose new avatar"}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-green-400 px-4 py-3 font-semibold text-[#071a0d] transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto md:px-8"
            >
              <FiSave />
              {saving ? "Saving" : "Save profile"}
            </button>
          </section>

          <aside className="flex flex-col items-center justify-center border-t border-white/10 bg-[#102f19] p-8 text-center lg:border-l lg:border-t-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt=""
                className="h-28 w-28 rounded-full object-cover ring-2 ring-green-400"
              />
            ) : (
              <UserAvatar user={{ ...user, ...form }} size="lg" />
            )}
            <h2 className="mt-5 max-w-full truncate text-2xl font-semibold">
              {form.fullName || user?.fullName}
            </h2>
            <p className="mt-1 max-w-full truncate text-sm text-slate-400">
              {form.email || user?.email}
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default ProfilePage;
