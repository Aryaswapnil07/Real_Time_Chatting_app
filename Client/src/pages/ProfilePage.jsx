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
    <main className="page-shell page-shell--profile min-h-dvh bg-[#071a0d] p-2 text-slate-100 sm:p-3 md:p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100dvh-1rem)] max-w-2xl items-center justify-center sm:min-h-[calc(100dvh-1.5rem)] md:max-w-4xl lg:max-w-5xl">
        <form
          onSubmit={handleSubmit}
          className="grid w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b2412]/95 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-2xl lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]"
        >
          {/* MAIN FORM SECTION - Responsive */}
          <section className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-5 flex items-center gap-2 text-xs text-slate-400 transition hover:text-slate-100 sm:mb-6 sm:text-sm"
            >
              <FiArrowLeft className="text-base sm:text-lg" />
              <span className="hidden sm:inline">Back to chats</span>
              <span className="sm:hidden">Back</span>
            </button>

            {/* Page heading */}
            <div className="mb-4 sm:mb-6">
              <p className="text-xs text-slate-400 sm:text-sm">@{user?.username}</p>
              <h1 className="text-2xl font-semibold sm:text-3xl">Profile</h1>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 sm:mb-4 sm:px-4 sm:py-3 sm:text-sm">
                {error}
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-3 sm:space-y-4">
              {/* Full name */}
              <label className="block">
                <span className="mb-1.5 block text-xs text-slate-400 sm:mb-2 sm:text-sm">
                  Full name
                </span>
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:px-4 sm:py-3 sm:text-sm"
                  required
                />
              </label>

              {/* Email */}
              <label className="block">
                <span className="mb-1.5 block text-xs text-slate-400 sm:mb-2 sm:text-sm">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:px-4 sm:py-3 sm:text-sm"
                  required
                />
              </label>

              {/* Bio */}
              <label className="block">
                <span className="mb-1.5 block text-xs text-slate-400 sm:mb-2 sm:text-sm">
                  Bio
                </span>
                <textarea
                  value={form.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-xs outline-none transition focus:border-green-400 sm:min-h-32 sm:px-4 sm:py-3 sm:text-sm"
                />
              </label>

              {/* Avatar upload */}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 bg-[#071a0d] px-3 py-2 text-xs text-slate-300 transition hover:border-green-400/70 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-500/15 text-sm text-green-400 sm:h-11 sm:w-11">
                  <FiImage className="text-base sm:text-lg" />
                </span>
                <span className="truncate">
                  {avatarFile ? avatarFile.name : "Choose new avatar"}
                </span>
              </label>
            </div>

            {/* Save button - Full width on mobile, auto on larger screens */}
            <button
              type="submit"
              disabled={saving}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-400 px-3 py-2 text-xs font-semibold text-[#071a0d] transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-5 sm:px-4 sm:py-3 sm:text-sm lg:w-auto lg:px-6"
            >
              <FiSave className="text-base sm:text-lg" />
              {saving ? "Saving" : "Save profile"}
            </button>
          </section>

          {/* AVATAR PREVIEW SECTION - Right sidebar on desktop, bottom on mobile */}
          <aside className="flex flex-col items-center justify-center border-t border-white/10 bg-[#102f19] p-4 text-center sm:p-6 lg:border-l lg:border-t-0 lg:p-6 xl:p-8">
            {/* Avatar image */}
            <div className="mb-3 sm:mb-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-green-400 sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                />
              ) : (
                <div className="sm:scale-110 lg:scale-100">
                  <UserAvatar user={{ ...user, ...form }} size="lg" />
                </div>
              )}
            </div>

            {/* Full name */}
            <h2 className="max-w-full truncate text-xl font-semibold sm:text-2xl">
              {form.fullName || user?.fullName}
            </h2>

            {/* Email */}
            <p className="mt-0.5 max-w-full truncate text-xs text-slate-400 sm:mt-1 sm:text-sm">
              {form.email || user?.email}
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default ProfilePage;