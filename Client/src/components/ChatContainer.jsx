import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiImage,
  FiMessageCircle,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import UserAvatar from "./UserAvatar";
import { formatLastSeen, formatMessageTime, getId } from "../utils/chat";

const ChatContainer = ({
  currentUser,
  selectedConversation,
  selectedPeer,
  messages,
  loading,
  sending,
  onBack,
  onSendMessage,
  onDeleteMessage,
}) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedConversation?._id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!text.trim() && !image.trim()) {
      return;
    }

    await onSendMessage({ text, image });
    setText("");
    setImage("");
    setShowImageInput(false);
  };

  if (!selectedConversation) {
    return (
      <section className="hidden h-full min-h-0 flex-col items-center justify-center gap-4 bg-[#102f19] px-6 text-center lg:flex">
        <div className="grid h-16 w-16 place-items-center rounded-lg bg-green-400 text-3xl text-[#071a0d]">
          <FiMessageCircle />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Select a chat</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Your conversations and live messages will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#102f19]">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <button
          type="button"
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 lg:hidden"
          title="Back"
        >
          <FiArrowLeft />
        </button>

        <UserAvatar user={selectedPeer} showStatus />

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {selectedPeer?.fullName || "Conversation"}
          </p>
          <p className="truncate text-xs text-slate-400">
            {selectedPeer?.isOnline ? "Online" : formatLastSeen(selectedPeer?.lastSeen)}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-green-400/25 border-t-green-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isMine = getId(message.sender) === getId(currentUser);
              const sender = isMine ? currentUser : message.sender;

              return (
                <div
                  key={message._id}
                  className={`group flex ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[88%] items-end gap-2 md:max-w-[76%] ${
                      isMine ? "flex-row-reverse" : ""
                    }`}
                  >
                    <UserAvatar user={sender} size="sm" />

                    <div className={isMine ? "items-end" : "items-start"}>
                      {message.image && (
                        <a
                          href={message.image}
                          target="_blank"
                          rel="noreferrer"
                          className="mb-1 block overflow-hidden rounded-lg border border-white/10"
                        >
                          <img
                            src={message.image}
                            alt=""
                            className="max-h-64 max-w-full object-cover"
                          />
                        </a>
                      )}

                      {message.text && (
                        <p
                          className={`break-words rounded-lg px-3 py-2 text-sm leading-6 ${
                            isMine
                              ? "rounded-br-sm bg-green-400 text-[#071a0d]"
                              : "rounded-bl-sm bg-white/10 text-slate-100"
                          }`}
                        >
                          {message.text}
                        </p>
                      )}

                      <div
                        className={`mt-1 flex items-center gap-2 text-[11px] text-slate-500 ${
                          isMine ? "justify-end" : ""
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isMine && (
                          <button
                            type="button"
                            onClick={() => onDeleteMessage(message._id)}
                            className="opacity-0 transition hover:text-red-200 group-hover:opacity-100"
                            title="Delete message"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!messages.length && (
              <div className="flex h-[45vh] items-center justify-center text-sm text-slate-400">
                No messages yet
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-white/10 bg-[#0b2412] p-3"
      >
        {showImageInput && (
          <input
            value={image}
            onChange={(event) => setImage(event.target.value)}
            className="mb-3 w-full rounded-lg border border-white/10 bg-[#071a0d] px-3 py-2 text-sm outline-none transition placeholder:text-slate-500 focus:border-green-400"
            placeholder="Image URL"
          />
        )}

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setShowImageInput((current) => !current)}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 transition ${
              showImageInput
                ? "bg-green-400 text-[#071a0d]"
                : "text-slate-300 hover:bg-white/10"
            }`}
            title="Add image URL"
          >
            <FiImage />
          </button>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-white/10 bg-[#071a0d] px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-green-400"
            placeholder="Message"
          />

          <button
            type="submit"
            disabled={sending || (!text.trim() && !image.trim())}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-green-400 text-[#071a0d] transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-60"
            title="Send"
          >
            <FiSend />
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatContainer;
