import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import { ApiHelper } from "./ApiHelper";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { fetchOrders } from "../slices/orderSlice";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  shipperId: number;
  amount: number;
}

export default function PaymentModal({ isOpen, onClose, orderId,shipperId, amount }: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Call Laravel backend with ApiHelper
      const res = await ApiHelper("POST", "/create-payment-intent", {
        order_id: orderId,
        amount: amount * 100, // Stripe needs cents
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
          style: {
            background: "#4caf50",
            color: "#fff",
            fontWeight: "bold",
          },
          icon: "💳",
        });
        await ApiHelper("POST", "/store-payment", {
            order_id: orderId,
            shipper_id: shipperId,
            amount: result.paymentIntent.amount / 100,
            currency: result.paymentIntent.currency,
            stripe_payment_intent: result.paymentIntent.id,
            stripe_payment_method: result.paymentIntent.payment_method,
            status: "captured",
        });

        dispatch(fetchOrders({ page: 1, per_page: 10 }));
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong!", {
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
        },
        icon: "⚠️",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="text-lg font-bold mb-4">Pay ${amount}</h2>
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
