import { useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";
import toast from "react-hot-toast";

const StripeConnectButton = () => {
  const [loading, setLoading] = useState(false);

    const handleStripeConnect = async () => {
    setLoading(true);
    try {
        const res = await ApiHelper("GET", "/stripe/connect");

        if (res.status === 200 && res.data.success && res.data.url) {
        // Redirect shipper to Stripe onboarding form
        window.location.href = res.data.url;
        } else {
        toast.error(res.data.message || "Failed to connect Stripe ❌");
        }
    } catch (err: any) {
        console.error("Stripe connect error:", err);
        toast.error(err.response?.data?.message || "Error connecting to Stripe", {
        style: { background: "#f44336", color: "#fff" },
        });
    } finally {
        setLoading(false);
    }
    };


  return (
    <button
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
      onClick={handleStripeConnect}
      disabled={loading}
    >
      {loading ? "Connecting..." : "Connect with Stripe"}
    </button>
  );
};

export default StripeConnectButton;
