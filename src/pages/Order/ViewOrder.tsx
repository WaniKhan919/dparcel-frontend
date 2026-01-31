import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchOrders } from "../../slices/orderSlice";
import ViewOffersDrawer from "../../utils/Drawers/Offers/ViewOffersDrawer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentModal from "../../utils/PaymentModal";
import ShopperOrderMessages from "../../utils/Drawers/Order/ShopperOrderMessages";
import TrackOrderDrawer from "../../utils/Drawers/Order/TrackOrderDrawer";
import ViewOrderDetailDrawer from "../../utils/Drawers/Offers/ViewOrderDetailDrawer";
import { useNavigate } from "react-router";
import { ChatBubbleLeftRightIcon, ClipboardDocumentCheckIcon, CreditCardIcon, DocumentTextIcon, EyeIcon, MapPinIcon } from "@heroicons/react/24/outline";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY!);

interface Request {
  id: number;
  service_type: string;
  total_aprox_weight: string;
  total_price: string;
  tracking_number: string;
  order_details: {
    id: number;
    quantity: number;
    price: string;
    product: {
      id: number;
      title: string;
      weight?: string;
    };
  }[];
  accepted_offer: {
    id: number;
    order_id: number;
    user_id: number;
    status: string;
  } | null;
  order_payment: {
    id: number;
    order_id: number;
    amount: string;
    status: string;
  } | null;

  // New relationships
  ship_from_country?: { id: number; name: string };
  ship_from_state?: { id: number; name: string };
  ship_from_city?: { id: number; name: string };
  ship_to_country?: { id: number; name: string };
  ship_to_state?: { id: number; name: string };
  ship_to_city?: { id: number; name: string };
}


export default function ViewOrder() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data} = useSelector((state: any) => state.order);
  const [openOrderDetailDrawer, setOpenOrderDetailDrawer] = useState(false)
  const [openOfferDrawer, setOpenOfferDrawer] = useState(false)
  const [orderData, setOrderData] = useState([])
  const [orderId, setOrderId] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Request | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [openMessageDrawer, setOpenMessageDrawer] = useState(false)
  const [openTrackOrderDrawer, setOpenTrackOrderDrawer] = useState(false)
  const [shipperId, setShipperId] = useState(0)

  const openPayment = (record: Request) => {
    setSelectedOrder(record);
    setShipperId(record.accepted_offer?.user_id ?? 0);
    setIsPaymentOpen(true);
  };

  const openMessage = (record: any) => {
    setOrderData(record)
    setOpenMessageDrawer(true)
  }
  const handleCustomDeclaration = (record: any) => {
    navigate("/custom/declaration", {
      state: { order_id: record.id }, // 👈 Pass order_id invisibly
    });
  }

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const viewOrderDetails = (id: number) => {
    setOrderId(id)
    setOpenOrderDetailDrawer(true)
  }
  const viewOffers = (record: any) => {
    setOrderData(record)
    setOpenOfferDrawer(true)
  }
  const trackOrder = (record: any) => {
    setOrderData(record)
    setOpenTrackOrderDrawer(true)
  }
  const onClose = () => {
    setOpenOfferDrawer(false)
    setOpenOrderDetailDrawer(false)
    setOpenMessageDrawer(false)
    setOpenTrackOrderDrawer(false)
  }

  const columns = [
    {
      key: "request_number",
      header: "Request No",
    },
    {
      key: "service_type",
      header: "Ship Type",
      render: (record: Request) =>
        record.service_type === "ship_for_me"
          ? "Ship For Me"
          : "Buy For Me",
    },
    {
      key: "ship_from",
      header: "Ship From / To",
      render: (record: Request) => (
        <div className="flex flex-col text-sm">
          <span>
            <b className="text-blue-600">From:</b>{" "}
            {record.ship_from_city?.name}, {record.ship_from_state?.name}
          </span>
          <span>
            <b className="text-green-600">To:</b>{" "}
            {record.ship_to_city?.name}, {record.ship_to_state?.name}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: Request) => (
        <div className="flex items-center gap-2">
          
          {/* View Details */}
          <button
            title="View Details"
            onClick={() => viewOrderDetails(record.id)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <EyeIcon className="h-5 w-5 text-gray-800 stroke-2" />
          </button>


          {/* View Offers */}
          <button
            title="View Offers"
            onClick={() => viewOffers(record)}
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100"
          >
            <DocumentTextIcon className="h-5 w-5 text-blue-700" />
          </button>

          {/* Payment */}
          {record.accepted_offer && !record.order_payment && (
            <button
              title="Make Payment"
              onClick={() => openPayment(record)}
              className="p-2 rounded-lg bg-green-50 hover:bg-green-100"
            >
              <CreditCardIcon className="h-5 w-5 text-green-700" />
            </button>
          )}

          {/* Track Order */}
          <button
            title="Track Order"
            onClick={() => trackOrder(record)}
            className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100"
          >
            <MapPinIcon className="h-5 w-5 text-purple-700" />
          </button>

          {/* Messages */}
          {record.accepted_offer && (
            <button
              title="Messages"
              onClick={() => openMessage(record)}
              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-700" />
            </button>
          )}

          {/* Custom Declaration */}
          <button
            title="Custom Declaration"
            onClick={() => handleCustomDeclaration(record)}
            className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100"
          >
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-orange-700" />
          </button>
        </div>
      ),
    }

  ];


  return (
    <>
      <PageMeta title="Delivering Parcel | Requests" description="" />
      <PageBreadcrumb pageTitle="Requests" />
      <div className="space-y-6">
        <ComponentCard title="Requests">
          <DParcelTable columns={columns} data={data} />
          {
            openOrderDetailDrawer &&
            <ViewOrderDetailDrawer
              isOpen={openOrderDetailDrawer}
              onClose={onClose}
              orderId={orderId}
            />
          }
          {
            openOfferDrawer &&
            <ViewOffersDrawer
              isOpen={openOfferDrawer}
              onClose={onClose}
              orderData={orderData}
            />
          }
          {isPaymentOpen && selectedOrder && (
            <Elements stripe={stripePromise}>
              <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                orderId={selectedOrder.id}
                shipperId={shipperId}
                amount={parseFloat(selectedOrder.total_price)}
              />
            </Elements>
          )}

          {
            openTrackOrderDrawer &&
            <TrackOrderDrawer
              isOpen={openTrackOrderDrawer}
              onClose={onClose}
              orderData={orderData}
            />
          }
          {
            openMessageDrawer &&
            <ShopperOrderMessages
              isOpen={openMessageDrawer}
              onClose={onClose}
              orderData={orderData}
            />
          }

        </ComponentCard>
      </div>
    </>
  );
}

