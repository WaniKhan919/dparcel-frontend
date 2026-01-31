import PageMeta from "../../components/common/PageMeta";
import { InfoIcon } from "../../icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchRequests } from "../../slices/shopperRequestSlice";
import { fetchNewOffers } from "../../slices/shipperNewOffersSlice";
import { fetchLatestMessages } from "../../slices/latestChatsSlice";
import { fetchOrderStatus } from "../../slices/orderStatusSlice";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Modal } from "../../components/ui/modal";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
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

export default function ShipperDashboard() {
  const [ordersData, setOrdersData] = useState<{
    accepted_orders: number;
  }>({
    accepted_orders: 0,
  });
  const [balance, setBalance] = useState<{
    total_credit: number;
    total_debit: number;
    balance: number;
  }>({
    total_credit: 0,
    total_debit: 0,
    balance: 0,
  });
  const [offerStats, setOfferStats] = useState<{
    accepted: number;
    inprogress: number;
  }>({
    accepted: 0,
    inprogress: 0,
  });
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading,} = useSelector((state: any) => state.shopperRequest);
  const { data: newOffers, loading: loadingOffers, meta, perPage } = useSelector((state: any) => state.shipperNewOffers);
  const { data: latestChats, loading: latestChatLoading } = useSelector((state: any) => state.latestChats);
  const { orderStatus} = useSelector((state: any) => state.orderStatus);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Notification | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: number | null;
    status: "inprogress" | "cancelled" | null;
  }>({ open: false, id: null, status: null });
  const [offerPrice, setOfferPrice] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const confirmRequest = async (id: number, status: "inprogress" | "cancelled") => {
    try {
      const response = await ApiHelper("POST", "/shipper/confirm/request", { id, status, offerPrice });

      if (response.status === 200) {
        dispatch(fetchRequests());
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
        setConfirmModal({ open: false, id: null, status: null });
      } else {
        toast.error(response.data.message);
        setConfirmModal({ open: false, id: null, status: null });
      }
    } catch (error) {
      setConfirmModal({ open: false, id: null, status: null });
      console.error(error);
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
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedOrder(notification);
    setIsModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchLatestMessages());
    dispatch(fetchOrderStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchNewOffers({ page, perPage: 12, status: filterStatus }));
  }, [dispatch, page, perPage, filterStatus]);

  useEffect(() => {
    fetchOrdersStats();
    fetchBalanceStats();
    fetchOfferStats();
  }, []);

  const fetchOrdersStats = async () => {
    
    try {
      const res = await ApiHelper("GET", "/shipper/dashboard/orders");

      if (res.status === 200 && res.data.success) {
        setOrdersData(res.data.data);
      } else {
        setOrdersData({
          accepted_orders: 0,
        });
      }
    } catch (err: any) {
    } finally {
      
    }
  };

  const fetchOfferStats = async () => {
    
    try {
      const res = await ApiHelper("GET", "/shipper/dashboard/offers");

      if (res.status === 200 && res.data.success) {
        setOfferStats({
          accepted: res.data.data.accepted ?? 0,
          inprogress: res.data.data.inprogress ?? 0,
        });
      } else {
        setOfferStats({ accepted: 0, inprogress: 0 });
      }
    } catch (err: any) {
      console.error(err);
      setOfferStats({ accepted: 0, inprogress: 0 });
    } finally {
      
    }
  };


  const fetchBalanceStats = async () => {
    
    try {
      const res = await ApiHelper("GET", "/shipper/dashboard/balance");

      if (res.status === 200 && res.data.success) {
        setBalance(res.data.data);
      } else {
        setBalance({
          total_credit: 0,
          total_debit: 0,
          balance: 0,
        });
      }
    } catch (err: any) {
    } finally {
      
    }
  };

  const notification: Notification[] = useMemo(() => {
    if (!requests) return [];
    return requests.map((item: any) => ({
      id: Number(item.id),
      name: item.user?.name || "Unknown",
      ship_from_country: item.ship_from_country,
      ship_from_state: item.ship_from_state,
      ship_from_city: item.ship_from_city,
      ship_to_country: item.ship_to_country,
      ship_to_state: item.ship_to_state,
      ship_to_city: item.ship_to_city,
      service_type: item.service_type,
      total_aprox_weight: Number(item.total_aprox_weight),
      total_price: Number(item.total_price),
    }));
  }, [requests]);

  return (
    <>
      <PageMeta
        title="Dashboard"
        description="International Package and mail Forwarding Services"
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 h-40 rounded-b-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2 pt-4">
              Welcome to your dashboard!
              <InfoIcon className="w-5 h-5 text-white" />
            </h1>
          </div>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 -mt-25">
            {/* Total Orders */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-blue-600 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">{loading ? "..." : ordersData.accepted_orders}</p>
                  <p className="text-gray-600">Total Orders</p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                  />
                </svg>
              </div>
              <div className="flex justify-end mt-4">
                <Link
                  to="/shipper/requests"
                  className="text-blue-600 font-medium text-sm"
                >
                  See all
                </Link>
              </div>
            </div>


            {/* Pickup Soon */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-yellow-400">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Your Offers</p>

                  <div className="flex gap-4">
                    <span className="text-green-600 text-sm font-medium">
                      Accepted: {loading ? "--" : offerStats.accepted}
                    </span>

                    <span className="text-blue-600 text-sm font-medium">
                      In Progress: {loading ? "--" : offerStats.inprogress}
                    </span>
                  </div>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-yellow-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>

              <div className="flex justify-end mt-3">
                <a
                  href="/shipper/offers"
                  className="text-blue-600 font-medium text-sm hover:underline"
                >
                  See all
                </a>
              </div>
            </div>


            {/* Balance */}
            <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-green-500 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">€{balance.balance}</p>
                  <p className="text-gray-600">Your current balance</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                  className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                </svg>

              </div>
              <div className="flex justify-end mt-4">
                <a href="#" className="text-blue-600 font-medium text-sm">
                  See all
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="col-span-4">
          {
            notification.length > 0 &&
            <Card notifications={notification} />
          }
        </div> */}
      </div>
      {/* 🔥 Messages + Requests Grid Container */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* LEFT: Latest Chats */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-3">Latest Chats</h2>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {latestChatLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : latestChats && latestChats.length > 0 ? (
              latestChats.map((chat: any) => {
                const initials = chat.username
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={chat.order_id}
                    onClick={() =>
                      navigate("/shipper/messages", {
                        state: { orderId: chat.order_id },
                      })
                    }
                    className={`flex items-center justify-between p-3 rounded-xl border transition
                      ${chat.unread_count > 0
                        ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${chat.unread_count > 0
                            ? "bg-blue-500 text-white"
                            : "bg-gray-400 text-white"
                          }`}
                      >
                        {initials}
                      </div>

                      <div>
                        <p className="font-medium text-gray-800">{chat.username}</p>
                        <p className="text-xs text-gray-500">
                          {chat.message_text || "No messages yet"}
                        </p>
                      </div>
                    </div>

                    {chat.unread_count > 0 ? (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                        {chat.unread_count}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {chat.last_message_time}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                No recent chats
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: New Requests */}
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-3">New Requests</h2>

          {/* Scrollable Area */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {loadingOffers && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {notification?.map((order: any) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 shadow-md border transition hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-white font-bold">
                        {order.name?.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {order.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.service_type === "ship_for_me"
                          ? "Ship For Me"
                          : "Buy For Me"}
                      </p>
                    </div>
                  </div>

                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    NEW
                  </span>
                </div>

                {/* Route */}
                <div className="mt-3 text-sm text-gray-600">
                  <b>From:</b> {order.ship_from_country}, {order.ship_from_state}, {order.ship_from_city}
                  <br />
                  <b>To:</b> {order.ship_to_country}, {order.ship_to_state}, {order.ship_to_city}
                </div>

                {/* Price + Weight */}
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-blue-600 font-semibold">
                      ${order.total_price}
                    </p>
                    <p className="text-xs text-gray-500">
                      Weight: {order.total_aprox_weight} kg
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewDetails(order)}
                    className="text-sm text-blue-600 font-medium underline hover:text-blue-800"
                  >
                    View Details
                  </button>
                </div>

                {/* 🔥 ACTION BUTTONS */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        id: order.id,          // ✅ correct
                        status: "cancelled",
                      })
                    }
                    className="w-1/2 py-2.5 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        id: order.id,          // ✅ correct
                        status: "inprogress",
                      })
                    }
                    style={{
                      backgroundImage: "linear-gradient(180deg, #003bff 25%, #0061ff 100%)",
                    }}
                    className="w-1/2 py-2.5 rounded-full text-white text-sm font-medium shadow-md"
                  >
                    Send Offer
                  </button>
                </div>
              </div>
            ))}


            {/* {newOffers?.map((order: any) => (
                <div
                  key={order.id}
                  className="border rounded-xl p-4 bg-green-50 border-green-300 hover:bg-green-100 transition"
                >
                  <div className="flex justify-between">
                    <p className="font-bold text-gray-800 text-sm">
                      From {order.ship_from_country}, {order.ship_from_state},{" "}
                      {order.ship_from_city}
                      {" "}→{" "}
                      {order.ship_to_country}, {order.ship_to_state},{" "}
                      {order.ship_to_city}
                    </p>

                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full h-fit">
                      NEW
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    Shipping Type:{" "}
                    {order.service_type === "buy_for_me"
                      ? "Buy For Me"
                      : "Ship For Me"}{" "}
                    | Weight: {order.total_aprox_weight}kg
                  </p>

                  <div className="flex justify-between mt-2">
                    <p className="text-gray-700 font-medium">
                      ${order.total_price}
                    </p>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      View details
                    </button>

                  </div>
                </div>
              ))} */}
          </div>
        </div>


      </div>
      <div className="mt-3 min-h-screen">
        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-lg border overflow-x-auto p-6">
          {/* Heading */}
          <div className="flex items-center justify-between mb-6">
            {/* Heading */}
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Offers
            </h2>

            {/* Filter */}
            <div className="w-64">
              <label className="sr-only">Filter by Status</label> {/* for accessibility */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
              >
                <option value="">Select status</option>
                {orderStatus?.map((st: any) => (
                  <option key={st.id} value={st.id}>
                    {st.name.charAt(0).toUpperCase() + st.name.slice(1)}
                  </option>
                ))}
              </select>

            </div>
          </div>



          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase text-xs tracking-wide">
                <th className="px-5 py-4 text-left">Request #</th>
                <th className="px-5 py-4 text-left">Service</th>
                <th className="px-5 py-4 text-left">Route</th>
                <th className="px-5 py-4 text-left">Weight</th>
                <th className="px-5 py-4 text-left">Price</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-center">Details</th>
              </tr>
            </thead>

            <tbody>
              {newOffers?.length > 0 ? (
                newOffers
                  .map((order: any) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-none hover:bg-blue-50/40 transition"
                    >
                      {/* Request */}
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {order.request_number}
                      </td>

                      {/* Service */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${order.service_type === "buy_for_me"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                            }`}
                        >
                          {order.service_type === "buy_for_me"
                            ? "Buy For Me"
                            : "Ship For Me"}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="px-5 py-4 text-gray-600">
                        <div className="leading-tight">
                          <p className="font-medium">
                            {order.ship_from_city} → {order.ship_to_city}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.ship_from_state}, {order.ship_to_state}
                          </p>
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="px-5 py-4">{order.total_aprox_weight} kg</td>

                      {/* Price */}
                      <td className="px-5 py-4 font-semibold text-blue-600">
                        ${order.total_price}
                      </td>

                      {/* Statuses */}
                      <td className="px-5 py-4 flex flex-wrap gap-1">
                        {order.order_details.map((item: any) => (
                          <span
                            key={item.id}
                            className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium"
                          >
                            {item.status}
                          </span>
                        ))}
                      </td>

                      {/* View */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No new requests available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          {meta && meta.total > 0 && (
            <div className="flex items-center justify-between mt-6 px-2">
              {/* Info */}
              <p className="text-sm text-gray-600">
                Page <span className="font-medium">{meta.current_page}</span> of{" "}
                <span className="font-medium">{meta.last_page}</span> — Total{" "}
                <span className="font-medium">{meta.total}</span> records
              </p>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={!meta.prev_page_url || loading}
                  onClick={() => setPage(meta.current_page - 1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition
          ${meta.prev_page_url
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  Previous
                </button>

                <button
                  disabled={!meta.next_page_url || loading}
                  onClick={() => setPage(meta.current_page + 1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition
          ${meta.next_page_url
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-100 text-blue-300 cursor-not-allowed"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>


      {/* {
        isModalOpen &&
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
                <p className="text-sm text-gray-500">
                  Request #: {selectedOrder.request_number}
                </p>
              </div>

              <div className="border rounded-xl p-4 bg-gray-50">
                <p className="font-medium text-gray-700 mb-1">Route</p>
                <p className="text-sm text-gray-600">
                  <strong>From:</strong>{" "}
                  {selectedOrder.ship_from_country},{" "}
                  {selectedOrder.ship_from_state},{" "}
                  {selectedOrder.ship_from_city}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>To:</strong>{" "}
                  {selectedOrder.ship_to_country},{" "}
                  {selectedOrder.ship_to_state},{" "}
                  {selectedOrder.ship_to_city}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Shipping Type</p>
                  <p className="font-medium">
                    {selectedOrder.service_type === "buy_for_me"
                      ? "Buy For Me"
                      : "Ship For Me"}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">
                    {selectedOrder.total_aprox_weight} kg
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="font-medium">
                    ${selectedOrder.total_price}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Shopper</p>
                  <p className="font-medium">
                    {selectedOrder.user.name}
                  </p>
                </div>
              </div>

              <div className="border rounded-xl p-4">
                <p className="font-medium text-gray-700 mb-2">
                  Order Items
                </p>

                <div className="space-y-2">
                  {selectedOrder.order_details.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">
                          {item.product.title}
                        </p>
                        <p className="text-gray-500">
                          Qty: {item.quantity} | Weight: {item.weight}kg
                        </p>
                      </div>

                      <p className="font-medium">
                        €{item.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      } */}
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
