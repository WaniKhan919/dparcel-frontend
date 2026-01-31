import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchAllOrders } from "../../slices/allOrderSlice";
import AdminOrderMessages from "../../utils/Drawers/Order/AdminOrderMessages";
import OrdedrSearchFilter from "../../utils/Drawers/Order/OrdedrSearchFilter";
import { ChatBubbleLeftIcon, EyeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../components/ui/modal";

interface Request {
  id: number;
  service_type: string;
  request_number: string;
  total_aprox_weight: string;
  total_price: string;
  order_details: {
    id: number;
    quantity: number;
    price: string;
    weight?: string;
    product: { id: number; title: string; weight?: string };
  }[];
  order_offer: any;
  order_status: { name: string } | null;
  user: { id: number; name: string };
  ship_from_country?: { name: string };
  ship_from_state?: { name: string };
  ship_from_city?: { name: string };
  ship_to_country?: { name: string };
  ship_to_state?: { name: string };
  ship_to_city?: { name: string };
}

export default function ViewAllRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, meta, loading } = useSelector((state: any) => state.allOrder);

  const [filters, setFilters] = useState({
    request_number: "",
    status: "",
    ship_from: "",
    ship_to: "",
    date: "",
  });
  const [page, setPage] = useState(1);

  const [openMessageDrawer, setOpenMessageDrawer] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [orderData, setOrderData] = useState<Request | null>(null);

  useEffect(() => {
    dispatch(fetchAllOrders({ page, per_page: 12, ...filters }));
  }, [dispatch, page, filters]);

  const openMessage = (record: Request) => {
    setOrderData(record);
    setOpenMessageDrawer(true);
  };

  const openDetails = (record: Request) => {
    setOrderData(record);
    setOpenDetailModal(true);
  };

  const trackOrder = (record: Request) => {
    console.log("Track order", record.id);
  };

  const handleSearch = (searchFilters: any) => {
    setPage(1);
    setFilters({
      request_number: searchFilters.requestNumber,
      status: searchFilters.status,
      ship_from: searchFilters.shipFrom,
      ship_to: searchFilters.shipTo,
      date: searchFilters.date,
    });
  };

  const handleReset = () => {
    setPage(1);
    setFilters({
      request_number: "",
      status: "",
      ship_from: "",
      ship_to: "",
      date: "",
    });
  };

  const columns = [
    { key: "request_number", header: "Request Number" },
    {
      key: "service_type",
      header: "Ship Type",
      render: (record: Request) => {
        const label = record.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me";
        const color = record.service_type === "ship_for_me" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} w-max`}>{label}</span>;
      },
    },
    {
      key: "ship_from_to",
      header: "Ship From / To",
      render: (record: Request) => (
        <div className="text-sm">
          <div><strong>From:</strong> {record.ship_from_country?.name ?? "-"}, {record.ship_from_state?.name ?? "-"}, {record.ship_from_city?.name ?? "-"}</div>
          <div><strong>To:</strong> {record.ship_to_country?.name ?? "-"}, {record.ship_to_state?.name ?? "-"}, {record.ship_to_city?.name ?? "-"}</div>
        </div>
      ),
    },
    { key: "total_price", header: "Total Price" },
    {
      key: "status",
      header: "Status",
      render: (record: Request) => {
        const status = (record.order_status?.name ?? "Pending").toLowerCase();
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",
          "awaiting payment": "bg-orange-100 text-orange-800",
          paid: "bg-blue-100 text-blue-800",
          purchased: "bg-indigo-100 text-indigo-800",
          "in warehouse": "bg-teal-100 text-teal-800",
          packed: "bg-purple-100 text-purple-800",
          shipped: "bg-cyan-100 text-cyan-800",
          "in transit": "bg-sky-100 text-sky-800",
          delivered: "bg-green-100 text-green-800",
          cancelled: "bg-gray-200 text-gray-800",
          returned: "bg-red-100 text-red-800",
        };
        return <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: Request) => (
        <div className="flex items-center gap-2">
          <button title="View Details" onClick={() => openDetails(record)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <EyeIcon className="h-5 w-5 text-gray-800 stroke-2" />
          </button>
          <button title="Track Order" onClick={() => trackOrder(record)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100">
            <MapPinIcon className="h-5 w-5 text-blue-700" />
          </button>
          <button title="Messages" onClick={() => openMessage(record)} className="p-2 rounded-lg bg-green-50 hover:bg-green-100">
            <ChatBubbleLeftIcon className="h-5 w-5 text-green-700" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | Requests" description="" />
      <PageBreadcrumb pageTitle="Requests" />
      <div className="space-y-6">
        <OrdedrSearchFilter onSearch={handleSearch} onReset={handleReset} />
        <ComponentCard title="Requests">
          <DParcelTable columns={columns} data={data} rowsPerPage={10} meta={meta} loading={loading} onPageChange={(newPage) => setPage(newPage)} />
        </ComponentCard>
      </div>

      {/* Messages Drawer */}
      {openMessageDrawer && <AdminOrderMessages isOpen={openMessageDrawer} onClose={() => setOpenMessageDrawer(false)} orderData={orderData} />}

      {/* Order Detail Modal */}
      {openDetailModal && orderData && (
        <Modal isOpen={openDetailModal} onClose={() => setOpenDetailModal(false)} className="max-w-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Request Details - {orderData.request_number}</h2>
          <div className="mb-3">
            <strong>Ship Type:</strong>{" "}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${orderData.service_type === "ship_for_me" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
              {orderData.service_type === "ship_for_me" ? "Ship For Me" : "Buy For Me"}
            </span>
          </div>
          <div className="mb-3">
            <div><strong>From:</strong> {orderData.ship_from_country?.name}, {orderData.ship_from_state?.name}, {orderData.ship_from_city?.name}</div>
            <div><strong>To:</strong> {orderData.ship_to_country?.name}, {orderData.ship_to_state?.name}, {orderData.ship_to_city?.name}</div>
          </div>
          <div className="mb-3">
            <strong>Products:</strong>
            <ul className="list-disc list-inside">
              {orderData.order_details?.map((d) => (
                <li key={d.id}>{d.product?.title} - Qty: {d.quantity} - Price: {d.price} - Weight: {d.weight}g</li>
              ))}
            </ul>
          </div>
          <div className="mb-3 flex gap-6">
            <div><strong>Total Weight:</strong> {orderData.total_aprox_weight} g</div>
            <div><strong>Total Price:</strong> ${orderData.total_price}</div>
          </div>
          <div className="mb-3"><strong>Shopper:</strong> {orderData.user?.name}</div>
          <div><strong>Status:</strong> {orderData.order_status?.name ?? "Pending"}</div>
        </Modal>
      )}
    </>
  );
}
