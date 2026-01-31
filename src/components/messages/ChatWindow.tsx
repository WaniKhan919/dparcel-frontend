import { useEffect, useRef, useState } from "react";
import { ChatItem } from "./Chat";

interface Attachment {
  id: number;
  file_path: string;
  file_type: string;
}

interface Message {
  id: number;
  sender: "user" | "admin";
  text: string;
  time: string;
  status: "pending" | "approved" | "rejected";
  attachments?: Attachment[];
}

interface ChatWindowProps {
  activeChat: ChatItem | null;
  messages: Message[];
  inputValue: string;
  setInputValue: (val: string) => void;
  sendMessage: (type: "text" | "image", content: string, file?: File) => void;
  isSending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  activeChat,
  messages,
  inputValue,
  setInputValue,
  sendMessage,
  isSending,
  fileInputRef,
}) => {
  // 🔹 Hooks at top-level (always run)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Handle sending message
  const handleSend = () => {
    if (inputValue.trim() !== "" && activeChat) {
      sendMessage("text", inputValue);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;
    sendMessage("image", "", file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const MessageTick = ({ status }: { status: string }) => {
    if (status === "approved") return <span className="ml-1 text-xs">✓✓</span>;
    if (status === "pending" || status === "rejected") return <span className="ml-1 text-xs">✓</span>;
    return null;
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 flex flex-col h-[400px] md:h-[600px]">
      {/* If no active chat */}
      {!activeChat ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 min-h-[400px]">
          <p>Select a conversation to start chatting.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="border-b pb-2 mb-2 flex items-center gap-3">
            <img
              src={activeChat.avatar || `https://ui-avatars.com/api/?name=${activeChat.name}`}
              alt={activeChat.name}
              className="w-10 h-10 rounded-full border"
            />
            <div>
              <p className="font-medium text-gray-800">{activeChat.name}</p>
              {activeChat.online && <p className="text-xs text-green-500">Online</p>}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 px-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}

                  {/* Attachments */}
                  {Array.isArray(msg.attachments) &&
                    msg.attachments.length > 0 &&
                    msg.attachments.map((file) => {
                      const isImage = file.file_type.startsWith("image/");
                      if (isImage) {
                        return (
                          <img
                            key={file.id}
                            src={file.file_path}
                            alt="attachment"
                            className="max-h-60 w-auto rounded mt-2 cursor-pointer hover:opacity-80"
                            onClick={() => setPreviewImage(file.file_path)}
                          />
                        );
                      } else {
                        return (
                          <a
                            key={file.id}
                            href={file.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs underline mt-2"
                          >
                            📎 Download file
                          </a>
                        );
                      }
                    })}

                  <div
                    className={`text-xs flex items-center justify-end gap-1 ${
                      msg.sender === "user" ? "text-gray-200" : "text-gray-500"
                    } mt-1`}
                  >
                    <span>{msg.time}</span>
                    {msg.sender === "user" && <MessageTick status={msg.status} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Image Preview Modal */}
          {previewImage && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-500000"
              onClick={() => setPreviewImage(null)}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="max-h-[90%] max-w-[90%] rounded shadow-lg"
                onClick={(e) => e.stopPropagation()} // prevent closing modal when clicking image
              />
            </div>
          )}

          {/* Input */}
          <div className="mt-2 flex gap-2 border-t pt-2 items-center">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isSending}
            />

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSending}
            >
              📎
            </button>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
              onClick={handleSend}
              disabled={isSending}
            >
              Send
            </button>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
