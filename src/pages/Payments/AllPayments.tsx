import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import PageMeta from "../../components/common/PageMeta";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { fetchPayments } from "../../slices/allPaymentSlice";

interface Request {
  id: number;
  order_id: number;
  shopper_id: number;
  shipper_id: number;
  amount: string;
  currency: string;
  stripe_payment_intent: string;
  stripe_payment_method: string;
  status: string;
  created_at: string;
  shopper:{
    name:string
  }
}

export default function AllPayments() {
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useSelector((state: any) => state.allPayments);

  useEffect(() => {
    dispatch(fetchPayments({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const columns = [
    { 
      header: "User Name",
      key: "name",
      render: (record: Request) => (
        <>{record.shopper.name}</>
      )
    },
    { key: "amount", header: "Amount" },
    { key: "currency", header: "Currency" },
    { key: "stripe_payment_intent", header: "Payment Intent" },
    { key: "stripe_payment_method", header: "Payment Method" },
    {
        key: "status",
        header: "Payment Status",
        render: (record: Request) => {
            const statusColors: Record<string, string> = {
                captured: "bg-green-100 text-green-800",
                succeeded: "bg-green-100 text-green-800",
                processing: "bg-yellow-100 text-yellow-800",
                requires_action: "bg-blue-100 text-blue-800",
                requires_capture: "bg-orange-100 text-orange-800",
                failed: "bg-red-100 text-red-800",
                canceled: "bg-gray-200 text-gray-800",
            };

            const colorClass =
                statusColors[record.status as keyof typeof statusColors] ||
                "bg-gray-100 text-gray-800";

            return (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {record.status}
                </span>
            );
        },
    },
    { key: "created_at", header: "Created At" },
  ];

  return (
    <>
      <PageMeta title="Delivering Parcel | All Payments" description="" />
      <PageBreadcrumb pageTitle="All Payments" />
      <div className="space-y-6">
        <ComponentCard title="Payments">
          <DParcelTable columns={columns} data={data} />
        </ComponentCard>
      </div>
    </>
  );
}

