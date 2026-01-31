import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";
import toast from "react-hot-toast";

interface ViewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

export default function TrackOrderDrawer({
  isOpen,
  onClose,
  orderData,
}: ViewOffersDrawerProps) {
  if (!orderData) return null;

  // const [isLoading, setIsLoading] = useState(false);
  const [orderTracking, setOrderTrackingData] = useState<any>([]);

  const getOrderTrackingData = async () => {
    // setIsLoading(true);
    try {
      const res = await ApiHelper("GET", `/order/get-order-tracking/${orderData.id}`);
      if (res.status === 200) {
        const trackingArray = res.data.data; // assume this is an array
         trackingArray.map((tracking: any) => ({
          id: tracking.id,
          status: tracking.status?.name
            ? "Order " + tracking.status.name.charAt(0).toUpperCase() + tracking.status.name.slice(1)
            : "Unknown",
          time: new Date(tracking.created_at).toLocaleString(), // format timestamp
          remarks: tracking.remarks || null,
        }));

        setOrderTrackingData(trackingArray);

      } else {
        setOrderTrackingData([]);
      }
    } catch {
      toast.error("Failed to fetch offers");
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderData.id) {
      getOrderTrackingData();
    }
  }, [orderData]);

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
          <h2 className="text-lg font-semibold">
            Order # :  {orderData?.request_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
          {/* Order History */}

          <div className="p-4">
            <h3 className="text-lg font-semibold mb-6">Order Tracking</h3>

            <ul className="relative">
              {orderTracking.map((status: any, idx: number) => {
                const isCompleted = status.is_completed;
                const nextStatus = orderTracking[idx + 1];
                const isCurrent = isCompleted && !nextStatus?.is_completed;

                return (
                  <li key={status.status_id} className="flex items-start relative">

                    {/* Left: circle + vertical line */}
                    <div className="flex flex-col items-center relative">
                      {/* Circle */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center z-10
                ${isCompleted
                            ? isCurrent
                              ? "bg-green-400 border-2 border-green-600 text-white"
                              : "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                          }`}
                      >
                        {!isCurrent && isCompleted ? "✓" : ""}
                      </div>

                      {/* Vertical line connecting to next circle */}
                      {idx !== orderTracking.length - 1 && (
                        <div
                          className={`w-1 h-6 mt-0.5 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`}
                        ></div>
                      )}
                    </div>

                    {/* Right: step info */}
                    <div className="ml-4">
                      <p
                        className={`text-sm font-medium ${isCurrent ? "text-blue-600" : "text-gray-800"
                          }`}
                      >
                        {status.status_name} {isCurrent && "(Current)"}
                      </p>

                      {status.tracking && (
                        <div className="text-xs text-gray-500 mt-1">
                          {status.tracking.tracking_number && (
                            <p>Tracking #: {status.tracking.tracking_number}</p>
                          )}
                          {status.tracking.created_at && (
                            <p>{new Date(status.tracking.created_at).toLocaleString()}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
