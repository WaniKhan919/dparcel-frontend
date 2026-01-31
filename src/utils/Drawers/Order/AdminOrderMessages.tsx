import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchAdminMessages } from "../../../slices/getAdminMessagesSlice";
import { ApiHelper } from "../../ApiHelper";
import toast from "react-hot-toast";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export default function AdminOrderMessages({
  isOpen,
  onClose,
  orderData,
}: DrawerProps) {
  if (!orderData) return null;

  const dispatch = useDispatch<AppDispatch>();
  const { data: messages, loading } = useSelector(
    (state: any) => state.getAdminMessages
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (orderData?.id) {
      dispatch(fetchAdminMessages({ order_id: orderData.id }));
    }
  }, [dispatch, orderData?.id]);

  const handleApproval = async (msgId: number, status: "approved" | "rejected") => {
    try {
      const res = await ApiHelper("POST", "/admin/messages/status", {
        message_id: msgId,
        status,
      });

      if (res.data.success) {
        toast.success(res.data.message, {
          duration: 3000,
          position: "top-right",
          icon: "🎉",
        });
        dispatch(fetchAdminMessages({ order_id: orderData.id }));
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      toast.error("Something went wrong");
    }
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
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex mb-2 ${i % 2 === 0 ? "justify-start" : "justify-end"
                    }`}
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
              {messages?.length === 0 ? (
                <p className="text-gray-400 text-center mt-8">
                  No messages found for this order.
                </p>
              ) : (
                messages.map((msg: any) => {
                  // Decide alignment
                  const isShipper = msg.sender?.role === "shipper";
                  const alignment = isShipper ? "justify-end" : "justify-start";
                  const bubbleColor = isShipper ? "bg-blue-200" : "bg-gray-200";
                  const textColor = "text-gray-900";

                  return (
                    <div key={msg.id} className={`flex ${alignment} mb-4`}>
                      <div className="max-w-xs md:max-w-md">
                        {/* Sender info */}
                        <p className="text-xs text-gray-500 mb-1">
                          {msg.sender?.name} ({msg.sender?.role})
                        </p>

                        {/* Message bubble */}
                        <div
                          className={`px-4 py-2 rounded-lg shadow ${bubbleColor} ${textColor} relative`}
                        >
                          {/* Text message */}
                          {msg.message_text && (
                            <p className="break-words mb-2">{msg.message_text}</p>
                          )}

                          {/* Attachments */}
                          {msg.attachments?.length > 0 && (
                            <div className="space-y-2">
                              {msg.attachments.map((file: any) => {
                                const isImage = file.file_type.startsWith("image/");
                                return (
                                  <div key={file.id} className="mb-2">
                                    {isImage ? (
                                      <img
                                        src={file.file_path}
                                        alt="attachment"
                                        className="max-h-60 w-auto rounded mb-1 cursor-pointer"
                                        onClick={() => window.open(file.file_path, "_blank")}
                                      />
                                    ) : (
                                      <a
                                        href={file.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm underline text-blue-600 mb-1"
                                      >
                                        📎 Download File
                                      </a>
                                    )}

                                    {/* Attachment Approval Actions */}
                                    {msg.status === "pending" ? (
                                      <div className="flex gap-2 mt-1">
                                        <button
                                          onClick={() =>
                                            handleApproval(msg.id, "approved")
                                          }
                                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleApproval(msg.id, "rejected")
                                          }
                                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    ) : (
                                      <span
                                        className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded ${msg.status === "approved"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                          }`}
                                      >
                                        {msg.status}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Message Timestamp */}
                          <span className="block text-xs mt-2 text-gray-500">
                            {msg.created_at}
                          </span>

                          {/* Message Approval (optional, if you want per-message too) */}
                          {msg.message_text && msg.status === "pending" && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleApproval(msg.id, "approved")}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproval(msg.id, "rejected")}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>

          )}

          <div ref={messagesEndRef}></div>
        </div>
      </div>
    </div>
  );
}
