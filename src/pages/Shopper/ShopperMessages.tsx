import { useEffect, useState, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Chat, { ChatItem } from "../../components/messages/Chat";
import ChatWindow from "../../components/messages/ChatWindow";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchShopperChatContacts } from "../../slices/shopper/shopperChatContactsSlice";
import { fetchChatMessages, clearMessages } from "../../slices/messagesSlice";
import { getUser } from "../../utils/DparcelHelper";
import { ApiHelper } from "../../utils/ApiHelper";
import { useLocation } from "react-router";

export default function ShopperMessages() {
  const location = useLocation();
  const { orderId } = location.state || {};

  const dispatch = useDispatch<AppDispatch>();

  const { data: contacts } = useSelector((state: any) => state.shopperChatContacts);
  const { data: messages } = useSelector((state: any) => state.messages);

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "ship_for_me" | "buy_for_me"
  >("all");

  const user = getUser();

  useEffect(() => {
    if (orderId) {
      setActiveChatId(orderId);
    }
  }, [orderId]);

  // Fetch contacts on mount
  useEffect(() => {
    dispatch(fetchShopperChatContacts());
  }, [dispatch]);

  // Fetch messages whenever activeChatId changes
 useEffect(() => {
    if (activeChatId) {
      dispatch(fetchChatMessages(activeChatId)); 
      dispatch(fetchShopperChatContacts());
    } else {
      dispatch(clearMessages());
    }
  }, [activeChatId, dispatch]);
  

  // Map contacts to ChatItem for sidebar
  const chats: ChatItem[] = contacts.map((item: any) => ({
    id: item.order_id,
    name: item.shipper_name,
    receiver_id: item.shipper_id,
    request_number: item.request_number,
    lastMessage: item.last_message || "No messages yet",
    time: item.last_time,
    unread: item.unread_count>0?item.unread_count:null,
    online: true,
    service_type: item.service_type, 
  }));

  // Map messages to ChatWindow format
  const formattedMessages = messages.map((msg: any) => ({
    id: msg.id,
    sender: msg.sender.id === Number(user.id) ? "user" : "admin",
    text: msg.message_text,
    time: msg.created_at
      ? new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    status: msg.status,
    unread: msg.unread_count>0?msg.unread_count:null,
    attachments: msg.attachments || [],
  }));

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // 🔹 Send Message Function
  const sendMessage = async (type: "text" | "image", content: string, file?: File) => {
    if (!content && !file) return;
    if (!activeChat) return;
    try {
      setIsSending(true);

      const formData = new FormData();
      formData.append("order_id", activeChat.id.toString());
      formData.append("receiver_id", activeChat.receiver_id.toString()); // sender_id required by backend

      if (type === "text" && content.trim() !== "") {
        formData.append("message_text", content.trim());
      }
      if (file) {
        formData.append("attachments", file);
      }

      const res = await ApiHelper("POST", "/messages/send", formData, {}, true);

      if (res.data.success) {
        dispatch(fetchChatMessages(activeChat.id)); // Refresh messages
        setInputMessage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };
  
  const filteredChats = chats.filter((chat) => {
    // 🔍 Search filter
    const searchMatch =
      chat.name.toLowerCase().includes(search.toLowerCase()) ||
      chat.request_number.toLowerCase().includes(search.toLowerCase());

    // 📌 Tabs filter
    const filterMatch =
      activeFilter === "all"
        ? true
        : activeFilter === "unread"
        ? chat.unread && chat.unread > 0
        : chat.service_type === activeFilter;

    return searchMatch && filterMatch;
  });

  return (
    <>
      <PageMeta title="Messages" description="International Package and mail Forwarding Services" />
      <div className="grid grid-cols-12 gap-4 md:gap-6 p-4">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <Chat
            chats={filteredChats}
            activeChat={activeChatId}
            onChatClick={setActiveChatId}
            search={search}
            setSearch={setSearch}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>

        {/* Chat Window */}
        <div className="col-span-12 md:col-span-7 lg:col-span-8">
          <ChatWindow
            activeChat={activeChat}
            messages={formattedMessages}
            inputValue={inputMessage}
            setInputValue={setInputMessage}
            sendMessage={sendMessage}
            isSending={isSending}
            fileInputRef={fileInputRef}
          />
        </div>
      </div>
    </>
  );
}
