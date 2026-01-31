import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import { ApiHelper } from "./ApiHelper";

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipperLevelId: number;
  amount: number;
}

export default function SubscriptionPaymentModal({
  isOpen,
  onClose,
  shipperLevelId,
  amount,
}: SubscriptionPaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      
      const res = await ApiHelper("POST", "/create-payment-intent", {
        amount: amount * 100,
      });

      if (res.status !== 200) {
        toast.error(res.data?.message || "Failed to create payment intent ❌");
        setLoading(false);
        return;
      }

      const { clientSecret } = res.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed ❌");
      } else if (result.paymentIntent?.status === "succeeded") {
        toast.success("✅ Payment successful!", {
          style: { background: "#4caf50", color: "#fff", fontWeight: "bold" },
          icon: "💳",
        });

        // Save subscription payment to backend
        await ApiHelper("POST", "/shipper/subscribe", {
          shipper_level_id: shipperLevelId,
          amount: result.paymentIntent.amount / 100,
          currency: result.paymentIntent.currency,
          stripe_payment_intent: result.paymentIntent.id,
          stripe_payment_method: result.paymentIntent.payment_method,
          status: "active",
        });

        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong!", {
        style: { background: "#f44336", color: "#fff", fontWeight: "bold" },
        icon: "⚠️",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="text-lg font-bold mb-4">Subscribe for ${amount}</h2>
      <form onSubmit={handlePayment} className="space-y-4">
        <div className="p-3 border rounded-md bg-white dark:bg-gray-800">
          <CardElement />
        </div>
        <Button type="submit" className="w-full" size="sm" disabled={!stripe || loading}>
          {loading ? "Processing..." : `Pay $${amount}`}
        </Button>
      </form>
    </Modal>
  );
}
