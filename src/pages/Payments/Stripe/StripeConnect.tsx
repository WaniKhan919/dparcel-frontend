import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LinkIcon } from "@heroicons/react/24/outline";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { ApiHelper } from "../../../utils/ApiHelper";

interface StripeAccount {
    id: number;
    stripe_account_id: string;
    stripe_onboarded: boolean;
    stripe_charges_enabled: boolean;
    stripe_details_submitted: boolean;
}

export default function StripeConnect() {
    const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [connecting, setConnecting] = useState<boolean>(false);

    // Fetch Stripe account status using ApiHelper
    const fetchStripeStatus = async () => {
        setLoading(true);
        try {
            const res = await ApiHelper("GET", "/stripe/status");
            if (res.status === 200 && res.data.success) {
                setStripeAccount(res.data.details);
            } else {
                toast.error(res.data.message || "Failed to fetch Stripe status");
            }
        } catch (err: any) {
            console.error("Stripe Status Error:", err);
            toast.error(err.response?.data?.message || "Error fetching Stripe status");
        } finally {
            setLoading(false);
        }
    };

    // Create Stripe onboarding link
    const handleConnectStripe = async () => {
        setConnecting(true);
        try {
            const res = await ApiHelper("GET", "/stripe/connect");
            if (res.status === 200 && res.data.success) {
                window.location.href = res.data.url; // redirect to Stripe onboarding
            } else {
                toast.error(res.data.message || "Failed to create Stripe account link");
            }
        } catch (err: any) {
            console.error("Stripe Connect Error:", err);
            toast.error(err.response?.data?.message || "Error connecting Stripe");
        } finally {
            setConnecting(false);
        }
    };
    useEffect(() => {
        fetchStripeStatus();
    }, []);

    return (
        <>
            <PageMeta title="Delivering Parcel | Stripe Connect" description="" />
            <PageBreadcrumb pageTitle=" Stripe Connect" />
            <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                    <LinkIcon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-lg font-semibold">Stripe Connect</h2>
                </div>

                {loading ? (
                    <p className="text-gray-500">Loading account status...</p>
                ) : stripeAccount ? (
                    <>
                        {stripeAccount.stripe_onboarded && stripeAccount.stripe_charges_enabled ? (
                            <div className="text-green-600 font-medium">✅ Stripe account is active and ready to receive payments</div>
                        ) : (
                            <div className="text-yellow-600 font-medium">
                                ⚠ Stripe account is connected but not active. Complete onboarding to enable payments.
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500">No Stripe account connected yet.</p>
                )}

                <button
                    onClick={handleConnectStripe}
                    disabled={connecting}
                    className={`mt-4 w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md font-medium text-white transition
            ${connecting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                    {connecting ? "Connecting..." : "Connect / Onboard Stripe Account"}
                </button>
            </div>
        </>
    );
}
