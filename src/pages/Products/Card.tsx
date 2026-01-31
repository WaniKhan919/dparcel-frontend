import { useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";

interface Notification {
  id: number;
  name: string;
  ship_from_country: string;
  ship_from_state: string;
  ship_from_city: string;
  ship_to_country: string;
  ship_to_state: string;
  ship_to_city: string;
  service_type: string;
  total_aprox_weight: number;
  total_price: number;
}

interface CardToastProps {
  notifications: Notification[];
}

export default function CardToast({ notifications }: CardToastProps) {
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Notification | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: number | null;
    status: "inprogress" | "cancelled" | null;
  }>({ open: false, id: null, status: null });
  const [offerPrice, setOfferPrice] = useState("");
  const [error, setError] = useState("");

  const handleHide = (id: number) => {
    setHiddenIds((prev) => [...prev, id]);
  };


  const confirmRequest = async (id: number, status: "inprogress" | "cancelled") => {
    try {
      const response = await ApiHelper("POST", "/shipper/confirm/request", { id, status, offerPrice });

      if (response.status === 200) {
        toast.success(response.data.message, {
          duration: 3000,
          position: "top-right",
          // style: {
          //   background: "#4caf50",
          //   color: "#fff",
          //   fontWeight: "bold",
          // },
          icon: "🎉",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("API Error!");
    }
  };

  const handleConfirm = () => {
    if (confirmModal.status == "inprogress" && offerPrice == "") {
      setError("Price is required");
      return;
    }
    setError("");
    if (confirmModal.id && confirmModal.status) {
      confirmRequest(confirmModal.id, confirmModal.status);
    }
    setConfirmModal({ open: false, id: null, status: null });
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedOrder(notification);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Toast Cards */}
      <div className="fixed bottom-4 right-4 z-[100000] flex flex-col gap-3 max-h-[100vh] overflow-y-auto scroll-hidden">
        {notifications
          .filter((notification) => !hiddenIds.includes(notification.id))
          .map((notification, index) => (
            <div
              key={notification.id}
              className="w-80 bg-white rounded-3xl p-4 shadow-lg animate-slide-up animate-toast-pop"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Close / Hide button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleHide(notification.id)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-between items-center">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {notification.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{notification.name}</span>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="text-right text-sm font-semibold">
                  <div>{notification.total_aprox_weight} (g)</div>
                </div>
              </div>

              {/* Price */}
              <div className="p-4">
                <div className="mb-2">
                  <b>From:</b>{" "}
                  {notification.ship_from_country || "N/A"},{" "}
                  {notification.ship_from_state || "N/A"},{" "}
                  {notification.ship_from_city || "N/A"}
                </div>

                <div>
                  <b>To:</b>{" "}
                  {notification.ship_to_country || "N/A"},{" "}
                  {notification.ship_to_state || "N/A"},{" "}
                  {notification.ship_to_city || "N/A"}
                </div>
              </div>


              <div className="flex items-center justify-between mt-4">
                <div className="text-xl font-semibold text-blue-600">
                  {notification.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me"} ${" "}
                  {notification.total_price}
                </div>

                <button
                  onClick={() => handleViewDetails(notification)}
                  className="text-sm text-blue-600 font-medium underline hover:text-blue-800"
                >
                  View Details
                </button>
              </div>


              {/* Buttons */}
              <div className="flex mt-3">
                <button
                  onClick={() =>
                    setConfirmModal({ open: true, id: notification.id, status: "cancelled" })
                  }
                  className="bg-gray-200 w-1/2 py-3 rounded-full mr-2"
                >
                  Cancelled
                </button>
                <button
                  onClick={() =>
                    setConfirmModal({ open: true, id: notification.id, status: "inprogress" })
                  }
                  style={{
                    backgroundImage: "linear-gradient(180deg, #003bff 25%, #0061ff 100%)",
                  }}
                  className="w-1/2 py-3 rounded-full ml-2 text-white font-medium shadow-md"
                >
                  Send Offer
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null, status: null })}
        className="max-w-md w-full m-4"
      >
        <div className="bg-white p-7 rounded-2xl shadow-xl">
          {/* Header */}
          <h3 className="text-2xl font-semibold mb-2 text-gray-900">
            {confirmModal.status == "inprogress" ? "Send Your Offer" : "Cancel This Offer"}
          </h3>

          <p className="text-gray-600 mb-6 leading-relaxed">
            You're about to{" "}
            <strong className="capitalize text-brand-600">
              {confirmModal.status == "inprogress" ? "Offer" : confirmModal.status}
            </strong>{" "}
            on this request.
            {confirmModal.status == "inprogress" ? "Please enter your price below." : " Are you sure to cancel this?"}
          </p>
          {/* PRICE BOX */}
          {
            confirmModal.status == "inprogress" ?
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 shadow-inner">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Your Offer Price ($)
                </label>

                <Input
                  type="number"
                  placeholder="Enter your price"
                  className="!h-12 !text-base"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
                {
                  error &&
                  <span className="text-red-600">{error}</span>
                }
              </div>
              : ""
          }

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setConfirmModal({ open: false, id: null, status: null })}
              className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-md transition 
          ${confirmModal.status === "inprogress"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-red-700 hover:bg-red-800"
                }
        `}
            >
              {confirmModal.status == "inprogress" ? "Send Offer" : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        className="max-w-2xl p-6"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Order Details
              </h2>
            </div>

            {/* From → To */}
            <div className="border rounded-xl p-4 bg-gray-50">
              <p className="font-medium text-gray-700 mb-1">Route</p>
              <p className="text-sm text-gray-600">
                <strong>From:</strong> {selectedOrder.ship_from_country}, {selectedOrder.ship_from_state}, {selectedOrder.ship_from_city}
              </p>
              <p className="text-sm text-gray-600">
                <strong>To:</strong> {selectedOrder.ship_to_country}, {selectedOrder.ship_to_state}, {selectedOrder.ship_to_city}
              </p>
            </div>

            {/* Service Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-4">
                <p className="text-sm text-gray-500">Shipping Type</p>
                <p className="font-medium">
                  {selectedOrder.service_type === "buy_for_me" ? "Buy For Me" : "Ship For Me"}
                </p>
              </div>

              <div className="border rounded-xl p-4">
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{selectedOrder.total_aprox_weight} kg</p>
              </div>

              <div className="border rounded-xl p-4">
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-medium">${selectedOrder.total_price}</p>
              </div>

              <div className="border rounded-xl p-4">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedOrder.name}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>


    </>
  );
}
