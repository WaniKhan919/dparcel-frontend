import { useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DParcelTable from "../../../components/tables/DParcelTable";
import { ApiHelper } from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import { ArrowPathIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";

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

export default function AdminWallet() {
    const [data, setData] = useState<WalletItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalCommission, setTotalCommission] = useState("0.00");
    const [masterAmount, setMasterAmount] = useState("0.00");
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"release" | "reverse" | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const handleRelease = (item: any) => {
        setSelectedItem(item);
        setModalType("release");
        setConfirmModalOpen(true);
    };

    const handleReverse = (item: any) => {
        setSelectedItem(item);
        setModalType("reverse");
        setConfirmModalOpen(true);
    };


    const columns = [
        {
            key: "request_number",
            header: "Request Number",
            render: (record: any) => (
                <>{record?.order?.request_number || "-"}</>
            )
        },
        {
            key: "name",
            header: "User",
            render: (record: any) => (
                <>{record?.user?.name || "-"}</>
            )
        },
        {
            key: "shipping_type_id",
            header: "Shipping Type",
            render: (record: any) => (
                <>{record?.shipping_type_id == 1 ? 'Buy For Me' : 'Ship For Me'}</>
            )
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
            key: "commission",
            header: "Commission",
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
        {
            key: "actions",
            header: "Actions",
            render: (record: any) => (
                <div className="flex gap-2">

                    {/* Show Release only when status = pending */}
                    {(record.status === "pending" || record.status === "reversed") && (
                        <div className="relative group">
                            <button
                                onClick={() => handleRelease(record)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-green-500 text-white shadow-sm hover:bg-green-600 transition"
                            >
                                <BanknotesIcon className="w-4 h-4" />
                                Release
                            </button>

                            {/* Tooltip */}
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition">
                                Release this payment
                            </span>
                        </div>
                    )}

                    {/* Show Reverse only when status = completed */}
                    {record.status === "completed" && (
                        <div className="relative group">
                            <button
                                onClick={() => handleReverse(record)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-red-500 text-white shadow-sm hover:bg-red-600 transition"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Reverse
                            </button>

                            {/* Tooltip */}
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition">
                                Reverse this transaction
                            </span>
                        </div>
                    )}

                </div>
            )
        }
    ];

    const fetchWallet = async () => {
        setLoading(true);
        try {
            const res = await ApiHelper("GET", "/admin/get-wallet");

            if (res.status === 200 && res.data.success) {
                setData(res.data.data); // your wallet list
                setTotalCommission(res.data.total_commission);
                setMasterAmount(res.data.master_account_amount);
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

    const handleConfirmAction = async () => {
        if (!selectedItem) return;

        setConfirmLoading(true);

        try {
            if (modalType === "release") {
                // API → Release Payment
                const res = await ApiHelper("POST", "/admin/release-payment", {
                    wallet_transaction_id: selectedItem.id,
                });

                if (res.status === 200 && res.data.success) {
                    toast.success("Payment released successfully!");
                } else {
                    toast.error(res.data.message || "Failed to release payment!");
                    return; // stop further execution
                }
            }

            if (modalType === "reverse") {
                // API → Reverse Transaction
                const res = await ApiHelper("GET", `/admin/reverse-transaction/${selectedItem.id}`);

                if (res.status === 200 && res.data.success) {
                    toast.success("Transaction reversed successfully!");
                } else {
                    toast.error(res.data.message || "Failed to reverse transaction!");
                    return; // stop further execution
                }
            }

            fetchWallet(); // refresh table only if API succeeds
            setConfirmModalOpen(false);

        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Operation failed!");
        } finally {
            setConfirmLoading(false);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                    {/* Total Commission Card */}
                    <div className="p-5 rounded-xl shadow-md bg-gradient-to-br from-green-50 to-white border border-green-100 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-100 text-green-700">
                            <i className="ri-money-dollar-circle-line text-3xl"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Commission</p>
                            <p className="text-3xl font-bold text-green-700 mt-1">${totalCommission}</p>
                        </div>
                    </div>

                    {/* Master Account Amount */}
                    <div className="p-5 rounded-xl shadow-md bg-gradient-to-br from-blue-50 to-white border border-blue-100 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-700">
                            <i className="ri-bank-card-2-line text-3xl"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Master Account Amount</p>
                            <p className="text-3xl font-bold text-blue-700 mt-1">${masterAmount}</p>
                        </div>
                    </div>

                </div>

                <ComponentCard title="Wallet">
                    <DParcelTable
                        columns={columns}
                        data={data}
                        loading={loading}
                    />
                </ComponentCard>
                {/* Confirm Release / Reverse Modal */}
                <Modal
                    isOpen={confirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    className="max-w-md m-4"
                >
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
                        <h4 className="text-xl font-semibold mb-4">
                            {modalType === "release" ? "Confirm Release Payment" : "Confirm Reverse Transaction"}
                        </h4>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to
                            <span className="font-semibold">
                                {modalType === "release"
                                    ? " release this payment?"
                                    : " reverse this transaction?"}
                            </span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" size="sm" onClick={() => setConfirmModalOpen(false)}>
                                Cancel
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleConfirmAction}
                                disabled={confirmLoading}
                                className={
                                    modalType === "release"
                                        ? "bg-green-600 text-white"
                                        : "bg-red-600 text-white"
                                }
                            >
                                {confirmLoading
                                    ? modalType === "release"
                                        ? "Releasing..."
                                        : "Reversing..."
                                    : modalType === "release"
                                        ? "Release"
                                        : "Reverse"}
                            </Button>
                        </div>
                    </div>
                </Modal>

            </div>
        </>
    );
}

