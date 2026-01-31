import { useEffect, useState } from "react";
import { ApiHelper } from "../../ApiHelper";

interface ViewOrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}

export default function ViewOrderDetailDrawer({
  isOpen,
  onClose,
  orderId,
}: ViewOrderDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await ApiHelper("GET", `/order/get-order-detail/${orderId}`);
        setOrderData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`relative bg-white shadow-xl h-full w-full sm:w-5/6 md:w-2/3 lg:w-1/2 rounded-l-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)] space-y-6">
          {loading && <div className="text-center text-gray-500">Loading...</div>}

          {!loading && orderData && (
            <>
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl p-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <h3 className="text-lg font-bold">
                    Request No: {orderData.request_number}
                  </h3>
                  {/* <span
                    className={`mt-2 sm:mt-0 inline-block text-xs px-3 py-1 rounded-full ${
                      orderData.status_name == "Delivered"
                        ? "bg-green-500"
                        : orderData.status_name == "Pending"
                        ? "bg-yellow-400"
                        : "bg-blue-500"
                    }`}
                  >
                    {orderData.status_name ?? "Pending"}
                  </span> */}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mt-4">
                  <div>
                    <p className="font-semibold opacity-90">Service Type</p>
                    <p className="capitalize">{orderData.service_type.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="font-semibold opacity-90">Ship From</p>
                    <p>{orderData.ship_from}</p>
                  </div>
                  <div>
                    <p className="font-semibold opacity-90">Ship To</p>
                    <p>{orderData.ship_to}</p>
                  </div>
                  <div>
                    <p className="font-semibold opacity-90">Weight</p>
                    <p>{orderData.total_aprox_weight} g</p>
                  </div>
                  <div>
                    <p className="font-semibold opacity-90">Total Price</p>
                    <p>${orderData.total_price}</p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              {/* Product Details */}
              {orderData.order_details?.length > 0 && (
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">
                    Product Details
                  </h4>
                  <div className="divide-y">
                    {orderData.order_details.map((detail: any) => (
                      <div
                        key={detail.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="flex gap-3 items-start w-full">
                          <img
                            src={detail.product.product_url}
                            alt={detail.product.title}
                            className="w-16 h-16 rounded-lg object-cover border"
                          />
                          <div className="flex-1">
                            {/* Request Detail Number Badge */}
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                #{detail.request_details_number}
                              </span>
                            </div>

                            <p className="font-medium text-gray-800">
                              {detail.product.title}
                            </p>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {detail.product.description}
                            </p>

                            <a
                              href={detail.product.product_url}
                              target="_blank"
                              className="text-blue-500 text-xs hover:underline mt-1 inline-block"
                            >
                              View Product
                            </a>
                          </div>
                        </div>

                        <div className="text-sm text-right sm:text-left w-full sm:w-auto">
                          <p>Qty: {detail.quantity}</p>
                          <p>Price: ${detail.price}</p>
                          <p>Weight: {detail.weight}g</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Details */}
              {orderData.order_services?.length > 0 && (
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">
                    Selected Services
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {orderData.order_services.map((srv: any) => (
                      <div
                        key={srv.id}
                        className="border rounded-lg px-3 py-2 text-sm flex justify-between items-center bg-gray-50"
                      >
                        <span className="font-medium">{srv.service.title}</span>
                        <span className="text-gray-700">${srv.service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
