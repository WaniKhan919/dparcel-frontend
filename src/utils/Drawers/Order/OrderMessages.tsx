import { useState, useRef, useEffect } from "react";
import { ApiHelper } from "../../ApiHelper";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchMessages } from "../../../slices/getMessagesSlice";
import { getUser } from "../../DparcelHelper";

interface ViewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export default function OrderMessages({
  isOpen,
  onClose,
  orderData,
}: ViewOffersDrawerProps) {
  if (!orderData) return null;

  const dispatch = useDispatch<AppDispatch>();
  const { data: messages, loading } = useSelector((state: any) => state.getMessages);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const user = getUser()

  // TODO: replace with actual logged-in user ID from auth state
  // const currentUserId = 3;

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (orderData?.id) {
      dispatch(fetchMessages({ order_id: orderData.id }));
    }
  }, [dispatch, orderData?.id]);

  const sendMessage = async (type: "text" | "image", content: string, file?: File) => {
    if (!content && !file) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("order_id", orderData?.id);
      formData.append("receiver_id", orderData?.order?.user_id);

      if (type === "text" && content.trim() !== "") {
        formData.append("message_text", content);
      }

      if (file) {
        formData.append("attachments", file);
      }

      const res = await ApiHelper("POST", "/messages/send", formData, {}, true);
      if (res.data.success) {
        dispatch(fetchMessages({ order_id: orderData.id }));
        setInputMessage("");
        if (fileInputRef.current) fileInputRef.current.value = ""; // reset file input
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sendMessage("image", "", file);
  };

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            Conversation – #{orderData?.order?.tracking_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            // Skeleton Loader
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex mb-2 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow animate-pulse ${i % 2 === 0 ? "bg-gray-200" : "bg-blue-200"
                      }`}
                  >
                    <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {messages?.map((msg: any) => {
                const isSender = Number(msg.sender_id) === Number(user.id);

                const bubbleBgClass = isSender
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900";

                return (
                  <div
                    key={msg.id}
                    className={`flex w-full mb-2 ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow ${bubbleBgClass}`}
                    >
                      {/* Message Text */}
                      {msg.message_text && (
                        <p className="break-words mb-2">{msg.message_text}</p>
                      )}

                      {/* Attachments */}
                      {msg.attachments?.length > 0 &&
                        msg.attachments.map((file: any) => {
                          const isImage = file.file_type.startsWith("image/");
                          return isImage ? (
                            <img
                              key={file.id}
                              src={file.file_path}
                              alt="attachment"
                              className="max-h-60 w-auto rounded mb-2 cursor-pointer hover:opacity-80"
                              onClick={() => setPreviewImage(file.file_path)}
                            />
                          ) : (
                            <a
                              key={file.id}
                              href={file.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm underline text-blue-200 mb-2"
                            >
                              📎 Download File
                            </a>
                          );
                        })}

                      {/* Timestamp */}
                      <span
                        className={`block text-xs mt-1 ${isSender ? "text-blue-100" : "text-gray-500"
                          }`}
                      >
                        {msg.created_at}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Image Preview Modal */}
              {previewImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                  onClick={() => setPreviewImage(null)}
                >
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-h-[90%] max-w-[90%] rounded shadow-lg"
                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
                  />
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef}></div>
        </div>


        {/* Input area */}
        <div className="px-4 py-3 border-t flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            disabled={isLoading}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => e.key === "Enter" && sendMessage("text", inputMessage)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Add attachment">
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none" />
              <path d="M14 3v5a1 1 0 0 0 1 1h5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none" />
              <circle cx="18" cy="18" r="3.2" fill="currentColor" />
              <path d="M18 16.4v3.2M16.4 18h3.2" stroke="white" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => sendMessage("text", inputMessage)}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
