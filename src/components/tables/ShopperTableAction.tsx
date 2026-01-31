import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ShopperTableAction = ({
  record,
  viewOrderDetails,
  viewOffers,
  openPayment,
  trackOrder,
  openMessage,
  handleCustomDeclaration,
}: any) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const toggleDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Actions
        <svg className="-mr-1 ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ top: position.top, left: position.left }}
            className="absolute mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          >
            <div className="py-1">
              <button
                onClick={() => { viewOrderDetails(record.id); setOpen(false); }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                View Detail
              </button>
              <button
                onClick={() => { viewOffers(record); setOpen(false); }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                View Offers
              </button>
              {record?.accepted_offer?.status === "accepted" && !record?.order_payment && (
                <button
                  onClick={() => { openPayment(record); setOpen(false); }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Make Payment
                </button>
              )}
              <button
                onClick={() => { trackOrder(record); setOpen(false); }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                Track Order
              </button>
              {record?.accepted_offer?.status === "accepted" && (
                <button
                  onClick={() => { openMessage(record); setOpen(false); }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Conversation
                </button>
              )}
              {record?.accepted_offer?.status === "accepted" && (
                <button
                  onClick={() => { handleCustomDeclaration(record); setOpen(false); }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Custom Declaration
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ShopperTableAction