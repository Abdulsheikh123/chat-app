"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentButtonProps {
  amount: number;
  onSuccess?: () => void;
  label?: string;
}

export default function PaymentButton({ amount, onSuccess, label = "Pay Now" }: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // 1. Create Order on Backend
      const { data } = await api.post("/payment/order", { amount });
      if (!data.success) throw new Error("Failed to create order");

      const { order } = data;

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "ChatApp Premium",
        description: `Adding credits to your account`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment on Backend
            const verifyRes = await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful!");
              if (onSuccess) onSuccess();
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            toast.error("Verification error");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#7c3aed", // Your primary purple color
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Payment failed to initialize");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={isProcessing}
      className="w-full gap-2 rounded-xl h-12 shadow-lg shadow-primary/20"
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <CreditCard className="h-5 w-5" />
      )}
      {label} ({amount} INR)
    </Button>
  );
}
