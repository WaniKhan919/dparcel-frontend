import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";
import { CurrencyDollarIcon, ShoppingBagIcon, MapPinIcon } from "@heroicons/react/24/outline"; // Heroicons
import SubscriptionPaymentModal from "../../utils/SubscriptionPaymentModal";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Link } from "react-router";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY!);

interface Subscription {
    id: number;
    shipper_level_id: number;
    status: "active" | "expired" | "pending";
}

interface ShipperLevel {
    id: number;
    title: string;
    fee: number;
    max_orders: number;
    max_locations: number;
    subscriptions?: Subscription[];
    isFeatured?: boolean;
}

export default function Subscription() {
    const [levels, setLevels] = useState<ShipperLevel[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<ShipperLevel | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchLevelsAndSubscriptions = async () => {
        try {
            const res = await ApiHelper("GET", "/shipper/levels");
            if (res.status === 200) {
                const data: ShipperLevel[] = res.data.data.map((lvl: ShipperLevel) =>
                    lvl.id === 2 ? { ...lvl, isFeatured: true } : lvl
                );
                setLevels(data);
            }
        } catch (err: any) {
            toast.error("Failed to fetch levels");
        }
    };

    useEffect(() => {
        fetchLevelsAndSubscriptions();
    }, []);


    const handleSubscribe = (level: ShipperLevel) => {
        setSelectedLevel(level);
        setModalOpen(true);
    };

    const handleFreePlan = async (level: ShipperLevel) => {
        setLoading(true);
        try {
            await ApiHelper("POST", "/shipper/subscribe", {
                shipper_level_id: level.id,
                amount: 0,
                currency: 'USD',
                stripe_payment_intent: 'nill',
                stripe_payment_method: 'nill',
                status: "active",
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong!", {
                style: { background: "#f44336", color: "#fff", fontWeight: "bold" },
                icon: "⚠️",
            });
        } finally {
            setLoading(false);
        }
    };
    const isSubscribed = (level: ShipperLevel) =>
        level.subscriptions?.some((sub) => sub.status === "active");

    return (
        <>
            <PageMeta title="Delivering Parcel | Subscription" description="" />
            <PageBreadcrumb pageTitle="Subscription" />

            <div className="space-y-6">
                <ComponentCard 
                    title="Subscription Plans"
                    actions={
                        <Link
                            to="/shipper/service-areas"
                            className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 inline-block text-center"
                            >
                            Add Service Areas
                        </Link>
                    }
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {levels.map((level) => {
                            const subscribed = isSubscribed(level);
                            return (
                                <div
                                    key={level.id}
                                    className={`relative rounded-2xl shadow-lg flex flex-col justify-between transition transform hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${level.isFeatured
                                        ? "border-2 border-blue-500"
                                        : "border border-gray-200 bg-white"
                                        }`}
                                >
                                    {/* Gradient Header */}
                                    <div
                                        className={`p-6 ${level.isFeatured
                                            ? "bg-gradient-to-b from-[#003bff] to-[#0061ff] text-white"
                                            : "bg-gray-50 text-gray-800"
                                            }`}
                                    >
                                        {level.isFeatured && (
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-xl text-xs font-bold z-10">
                                                Recommended
                                            </div>
                                        )}
                                        <h3 className="text-2xl font-bold mb-2">{level.title}</h3>
                                        <p className="text-3xl font-extrabold mb-4">
                                            ${Number(level.fee).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <ul className="space-y-3 text-gray-600 dark:text-gray-200">
                                            <li className="flex items-center gap-2">
                                                <CurrencyDollarIcon className="w-5 h-5 text-blue-500" />
                                                Fee: ${Number(level.fee).toFixed(2)}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <ShoppingBagIcon className="w-5 h-5 text-blue-500" />
                                                Max Orders: {level.max_orders}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <MapPinIcon className="w-5 h-5 text-blue-500" />
                                                Max Locations: {level.max_locations}
                                            </li>
                                        </ul>

                                        <Button
                                            size="sm"
                                            disabled={subscribed || loading}
                                            onClick={() =>
                                                level.fee <= 0
                                                    ? handleFreePlan(level)
                                                    : handleSubscribe(level)
                                            }
                                            className={`w-full py-2 mt-6 text-lg font-semibold ${subscribed
                                                ? "bg-green-500 hover:bg-green-600 cursor-not-allowed text-white"
                                                : level.isFeatured
                                                    ? "bg-gradient-to-r from-[#003bff] to-[#0061ff] text-white"
                                                    : "bg-gray-800 hover:bg-gray-900 text-white"
                                                }`}
                                        >
                                            {subscribed ? "Subscribed" : "Subscribe"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {selectedLevel && modalOpen && (
                        <Elements stripe={stripePromise}>
                            <SubscriptionPaymentModal
                                isOpen={modalOpen}
                                onClose={() => setModalOpen(false)}
                                shipperLevelId={selectedLevel.id}
                                amount={Number(selectedLevel.fee)}
                            />
                        </Elements>
                    )}
                </ComponentCard>
            </div>
        </>
    );
}
