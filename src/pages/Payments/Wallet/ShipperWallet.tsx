import { useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DParcelTable from "../../../components/tables/DParcelTable";
import { ApiHelper } from "../../../utils/ApiHelper";
import toast from "react-hot-toast";

interface WalletItem {
    id: number;
    user_id: number;
    order_id: number;
    shipping_type_id: number;
    transaction_type: string;
    amount: string;
    stripe_fee: string;
    commission: string;
    description: string;
    status: string;
    created_at: string;
}

export default function ShipperWallet() {
    const [data, setData] = useState<WalletItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const columns = [
        {
            key: "request_number",
            header: "Request Number",
            render: (record: any) => (
                <>{record?.order?.request_number || "-"}</>
            )
        },
        {
            key: "user_id",
            header: "User",
        },
        {
            key: "shipping_type_id",
            header: "Shipping Type",
        },
        {
            key: "transaction_type",
            header: "Transaction Type",
        },
        {
            key: "amount",
            header: "Amount",
        },
        {
            key: "stripe_fee",
            header: "Stripe Fee",
        },
        {
            key: "description",
            header: "Description",
        },
        {
            key: "status",
            header: "Payment Status",
            render: (record: any) => {
                const statusColors: Record<string, string> = {
                    completed: "bg-green-100 text-green-800",
                    pending: "bg-yellow-100 text-yellow-800",
                    failed: "bg-red-100 text-red-800",
                };

                const colorClass =
                    statusColors[record.status] ||
                    "bg-gray-100 text-gray-800";

                return (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                        {record.status}
                    </span>
                );
            },
        },
    ];

    const fetchWallet = async () => {
        setLoading(true);
        try {
            const res = await ApiHelper("GET", "/shipper/get-wallet");

            if (res.status === 200 && res.data.success) {
                setData(res.data.data); // your wallet list
            } else {
                toast.error(res.data.message || "Failed to fetch wallet ❌");
            }
        } catch (err: any) {
            console.error("Wallet Fetch Error:", err);
            toast.error(err.response?.data?.message || "Error loading wallet");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    return (
        <>
            <PageMeta title="Delivering Parcel | Wallet" description="" />
            <PageBreadcrumb pageTitle="Wallet" />
            <div className="space-y-6">
                <ComponentCard title="Wallet">
                    <DParcelTable
                        columns={columns}
                        data={data}
                        loading={loading}
                    />
                </ComponentCard>
            </div>
        </>
    );
}

