import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";
import toast from "react-hot-toast";
import { Modal } from "../../../components/ui/modal";

interface ViewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export default function ViewOffersDrawer({
  isOpen,
  onClose,
  orderData
}: ViewOffersDrawerProps) {
  if (!orderData) return null; // avoid crash if no data
  // const [loading, setLoading] = useState(false);
  const [offersData, setOffersData] = useState<any>([]);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: number | null;
    status: "rejected" | "accepted" | null;
  }>({ open: false, id: null, status: null });

  const getOffers = async () => {
    // setLoading(true);
    try {
      const res = await ApiHelper("GET", `/order/shipper/offers/${orderData.id}`);

      if (res.status === 200) {
        setOffersData(res.data.data)
      } else {
        setOffersData([])
      }
    } catch (err: any) {
      // setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (confirmModal.id && confirmModal.status) {
      handleOfferAction(confirmModal.id, confirmModal.status);
    }
    setConfirmModal({ open: false, id: null, status: null });
  };

  const handleOfferAction = async (offerId: number, status: "accepted" | "rejected") => {
    try {
      const res = await ApiHelper("POST", `/order/offer/${offerId}/status`, { status });

      if (res.status === 200) {
        toast.success(res.data.message || `Offer ${status}`, {
          duration: 3000,
          position: "top-right",
          style: {
            background: status === "accepted" ? "#4caf50" : "#ff9800",
            color: "#fff",
            fontWeight: "bold",
          },
          icon: status === "accepted" ? "✅" : "❌",
        });
        
        getOffers()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${status} ❌`, {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
        },
        icon: "⚠️",
      });
    }
  };


  useEffect(() => {
    if (orderData.id) {
      getOffers()
    }
  }, [orderData])

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Offers</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">
            ✕
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-4 space-y-4 p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-3 shadow-md">
            <h3 className="text-lg font-bold mb-3">
              Tracking: {orderData.tracking_number}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold">Service Type</p>
                <p className="opacity-90 capitalize">
                  {orderData.service_type.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <p className="font-semibold">Status</p>
                <p className="opacity-90">
                  {orderData.status === 1 ? "Active" : "Pending"}
                </p>
              </div>
              <div>
                <p className="font-semibold">Ship From</p>
                <p className="opacity-90">{orderData.ship_from}</p>
              </div>
              <div>
                <p className="font-semibold">Ship To</p>
                <p className="opacity-90">{orderData.ship_to}</p>
              </div>
              <div>
                <p className="font-semibold">Weight</p>
                <p className="opacity-90">{orderData.total_aprox_weight} g</p>
              </div>
              <div>
                <p className="font-semibold">Total Price</p>
                <p className="opacity-90">${orderData.total_price}</p>
              </div>
            </div>
          </div>


          {/* Product Details */}
          {orderData.order_details?.length > 0 && (
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <h4 className="text-lg font-semibold mb-3">Product Details</h4>
              {orderData.order_details.map((detail: any) => (
                <div
                  key={detail.id}
                  className="border-b last:border-b-0 py-2"
                >
                  <p className="font-medium">{detail.product.title}</p>
                  <p className="text-sm text-gray-600">
                    {detail.product.description}
                  </p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Qty: {detail.quantity}</span>
                    <span>Price: ${detail.price}</span>
                  </div>
                  <a
                    href={detail.product.product_url}
                    target="_blank"
                    className="text-blue-500 text-xs hover:underline mt-1 inline-block"
                  >
                    View Product
                  </a>
                </div>
              ))}
            </div>
          )}
          {/* Offers */}
          {offersData?.offers?.length > 0 ? (
            offersData.offers.map((offer: any) => (
              <div
                key={offer.id}
                className="w-full bg-white rounded-3xl p-5 shadow-md border mt-4"
              >
                <div className="flex justify-between items-center">
                  {/* Left Section */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {offer.shipper?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span>{offer.shipper?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="text-right text-sm font-semibold">
                    <div>{offersData.total_aprox_weight} g</div>
                  </div>
                </div>

                {/* From/To */}
                <div className="flex mt-4 text-sm">
                  <span className="w-1/2">
                    <b>From:</b> {offersData.ship_from}
                  </span>
                  <span className="w-1/2">
                    <b>To:</b> {offersData.ship_to}
                  </span>
                </div>

                {/* Service + Price */}
                <div className="text-lg font-semibold text-blue-600 mt-4">
                  {offersData.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me"} – $
                  {offersData.total_price}
                </div>

                {/* Buttons */}
                <div className="flex mt-4">
                  {["pending", "inprogress"].includes(offer.status) ? (
                    <>
                      <button
                        onClick={() =>
                          setConfirmModal({ open: true, id: offer.id, status: "rejected" })
                        }
                        className="bg-gray-200 w-1/2 py-2 rounded-full mr-2 hover:bg-gray-300 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({ open: true, id: offer.id, status: "accepted" })
                        }
                        style={{
                          backgroundImage: "linear-gradient(180deg, #003bff 25%, #0061ff 100%)",
                        }}
                        className="w-1/2 py-2 rounded-full ml-2 text-white font-medium shadow-md hover:opacity-90 transition"
                      >
                        Accept
                      </button>
                    </>
                  ) : (
                    <div
                      className={`w-full py-2 rounded-full text-center font-medium shadow-md
                              ${offer.status === "accepted" ? "bg-green-500 text-white" : ""}
                              ${offer.status === "rejected" ? "bg-red-500 text-white" : ""}
                              ${offer.status === "cancelled" ? "bg-yellow-500 text-white" : ""}
                              ${offer.status === "ignored" ? "bg-gray-400 text-white" : ""}`}
                    >
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </div>
                  )}
                </div>


              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-4">No offers available</p>
          )}
        </div>

      </div>
      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null, status: null })}
        className="max-w-md m-4"
      >
        <div className="bg-white p-6 rounded-2xl text-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Action</h3>
          <p className="mb-6 text-gray-600">
            Are you sure you want to{" "}
            <strong className="capitalize">{confirmModal.status}</strong> this request?
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setConfirmModal({ open: false, id: null, status: null })}
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg text-white transition ${
                confirmModal.status === "accepted"
                  ? "bg-green-500 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
    
  );
}
