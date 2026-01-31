import React from "react";

export interface ChatItem {
  id: number;
  name: string;
  request_number: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  receiver_id: number;
  unread?: number;
  online?: boolean;
  service_type?: string;
}

interface ChatProps {
  chats: ChatItem[];
  activeChat: number | null;
  onChatClick: (id: number) => void;
  search: string;
  setSearch: (v: string) => void;
  activeFilter: string;
  setActiveFilter: (v: any) => void;
}

const Chat: React.FC<ChatProps> = ({  
  chats,
  activeChat,
  onChatClick,
  search,
  setSearch,
  activeFilter,
  setActiveFilter, }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl border overflow-hidden">
      {/* 🔍 Search */}
      <div className="p-3 border-b">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or request..."
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring"
        />
      </div>

      {/* 🔘 Filters */}
      <div className="px-3 py-2 border-b">
        {/* <div className="flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap"> */}
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b text-sm">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "ship_for_me", label: "Ship For Me" },
            { key: "buy_for_me", label: "Buy For Me" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-sm transition
                ${
                  activeFilter === f.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>


      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatClick(chat.id)}
            className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer transition-all hover:bg-gray-50 
              ${activeChat === chat.id ? "bg-blue-50 border-l-4 border-blue-600" : ""}`}
          >
            {/* Left: Avatar + message */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}`}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full border"
                />
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div className="overflow-hidden">
                <p className="font-medium text-gray-800">{chat.name}</p>
                <p className="text-sm text-gray-600">{chat.request_number}</p>
                <p className="text-xs text-gray-500 line-clamp-2 w-40">
                  {chat.lastMessage}
                </p>
              </div>
            </div>

            {/* Right: Time + unread */}
            <div className="text-right flex flex-col items-end justify-between h-full">
              <p className="text-xs text-gray-500">{chat.time}</p>

              {chat.unread && chat.unread > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full mt-1">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
