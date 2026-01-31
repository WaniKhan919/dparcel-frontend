import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        className="flex items-center justify-center h-11 w-11 rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {/* Settings (Gear) Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94a1.125 1.125 0 011.11-.94h2.592c.55 0 1.021.398 1.11.94l.214 1.281c.063.374.313.686.645.87.072.04.146.082.22.127.325.196.72.257 1.075.124l1.217-.456c.43-.161.91.028 1.148.43l1.297 2.247c.238.402.164.91-.26 1.26l-1.004.827a1.125 1.125 0 00-.43.991c.007.086.007.172 0 .258a1.125 1.125 0 00.43.991l1.004.827c.424.35.498.858.26 1.26l-1.297 2.247c-.238.402-.718.591-1.148.43l-1.217-.456a1.125 1.125 0 00-1.076.124 6.47 6.47 0 01-.22.127c-.332.183-.582.495-.644.87l-.214 1.281a1.125 1.125 0 01-1.11.94H10.7a1.125 1.125 0 01-1.11-.94l-.214-1.281c-.062-.375-.312-.687-.644-.87a6.52 6.52 0 01-.22-.127 1.125 1.125 0 00-1.076-.124l-1.217.456c-.43.161-.91-.028-1.148-.43L4.975 14.4c-.238-.402-.164-.91.26-1.26l1.004-.827a1.125 1.125 0 00.43-.991 6.932 6.932 0 010-.258 1.125 1.125 0 00-.43-.991L5.235 9.246c-.424-.35-.498-.858-.26-1.26l1.297-2.247c.238-.402.718-.591 1.148-.43l1.217.456c.355.133.75.072 1.076-.124a6.52 6.52 0 01.22-.127c.332-.183.582-.495.644-.87L9.594 3.94z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <ul className="flex flex-col">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Link to="/profile">Profile</Link>
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Link to="/account">Account Settings</Link>
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
            >
              <Link to="/logout">Logout</Link>
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
