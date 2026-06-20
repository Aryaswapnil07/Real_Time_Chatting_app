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
      <section className="hidden h-full min-h-0 flex-col items-center justify-center gap-3 bg-[#102f19] px-4 text-center sm:px-6 md:flex">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-green-400 text-3xl text-[#071a0d] sm:h-16 sm:w-16">
          <FiMessageCircle />
        </div>
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">Select a chat</h2>
          <p className="mt-2 max-w-sm text-xs text-slate-400 sm:text-sm">
            Your conversations and live messages will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#102f19]">
      {/* HEADER - Responsive */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-3 sm:h-16 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 lg:hidden"
          title="Back"
        >
          <FiArrowLeft className="text-base sm:text-lg" />
        </button>

        <UserAvatar user={selectedPeer} showStatus />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold sm:text-base">
            {selectedPeer?.fullName || "Conversation"}
          </p>
          <p className="truncate text-xs text-slate-400">
            {selectedPeer?.isOnline ? "Online" : formatLastSeen(selectedPeer?.lastSeen)}
          </p>
        </div>
      </header>

      {/* MESSAGES AREA - Responsive */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-green-400/25 border-t-green-400 animate-spin sm:h-10 sm:w-10" />
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
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
                    className={`flex max-w-[85%] items-end gap-2 sm:max-w-[76%] ${
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
                            className="max-h-48 max-w-full object-cover sm:max-h-64"
                          />
                        </a>
                      )}

                      {message.text && (
                        <p
                          className={`break-words rounded-lg px-2.5 py-2 text-xs leading-5 sm:px-3 sm:py-2 sm:text-sm sm:leading-6 ${
                            isMine
                              ? "rounded-br-sm bg-green-400 text-[#071a0d]"
                              : "rounded-bl-sm bg-white/10 text-slate-100"
                          }`}
                        >
                          {message.text}
                        </p>
                      )}

                      <div
                        className={`mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 sm:gap-2 sm:text-[11px] ${
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
                            <FiTrash2 className="text-xs sm:text-sm" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!messages.length && (
              <div className="flex h-[40vh] items-center justify-center text-xs text-slate-400 sm:h-[45vh] sm:text-sm">
                No messages yet
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* MESSAGE INPUT FORM - Responsive */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-white/10 bg-[#0b2412] p-2 sm:p-3"
      >
        {showImageInput && (
          <input
            value={image}
            onChange={(event) => setImage(event.target.value)}
            className="mb-2 w-full rounded-lg border border-white/10 bg-[#071a0d] px-2.5 py-2 text-xs outline-none transition placeholder:text-slate-500 focus:border-green-400 sm:mb-3 sm:px-3 sm:py-2 sm:text-sm"
            placeholder="Image URL"
          />
        )}

        <div className="flex items-end gap-2">
          {/* Image button */}
          <button
            type="button"
            onClick={() => setShowImageInput((current) => !current)}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 transition sm:h-11 sm:w-11 ${
              showImageInput
                ? "bg-green-400 text-[#071a0d]"
                : "text-slate-300 hover:bg-white/10"
            }`}
            title="Add image URL"
          >
            <FiImage className="text-base sm:text-lg" />
          </button>

          {/* Message textarea */}
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            className="max-h-24 min-h-9 flex-1 resize-none rounded-lg border border-white/10 bg-[#071a0d] px-2.5 py-2 text-xs outline-none transition placeholder:text-slate-500 focus:border-green-400 sm:min-h-11 sm:max-h-32 sm:px-4 sm:py-3 sm:text-sm"
            placeholder="Message"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={sending || (!text.trim() && !image.trim())}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-400 text-[#071a0d] transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:w-11"
            title="Send"
          >
            <FiSend className="text-base sm:text-lg" />
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatContainer;