import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface DropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  closeOthers: () => void;
  notifications: any[];
  loading: boolean;
}

export default function MessageDropdown({
  isOpen,
  onToggle,
  closeOthers,
  notifications,
  loading,
}: DropdownProps) {
  const unreadCount = notifications.filter((m) => !m.is_read).length;

  const handleClick = () => {
    closeOthers();
    onToggle();
  };

  const handleMessageClick = () => {
    // You can handle mark-as-read API here if needed
    closeOthers();
  };

  return (
    <div className="relative">
      {/* Message Icon */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-blue-500">
            <span className="absolute inline-flex w-full h-full bg-blue-500 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}

        {/* Chat icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M20 2H4C2.9 2 2 2.9 2 4V18L6 14H20C21.1 14 22 13.1 22 12V4C22 2.9 21.1 2 20 2ZM20 12H5.17L4 13.17V4H20V12Z"
          />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeOthers}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700 px-3">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={closeOthers}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Message List */}
        <ul className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
          {loading && <li className="p-3 text-center text-gray-500">Loading...</li>}
          {!loading && notifications.length === 0 && (
            <li className="p-3 text-center text-gray-500">No notifications</li>
          )}

          {!loading &&
            notifications.map((msg) => (
              <li key={msg.id}>
                <DropdownItem
                  onItemClick={() => handleMessageClick()}
                  to={`/notifications/${msg.id}`}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                    !msg.is_read ? "bg-gray-50 dark:bg-gray-900" : ""
                  }`}
                >
                  <span className="flex-1">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {msg.title || msg.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {msg.message}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(msg.created_at || Date.now()).toLocaleTimeString()}
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))}
        </ul>
      </Dropdown>
    </div>
  );
}
