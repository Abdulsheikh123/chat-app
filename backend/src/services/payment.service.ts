import Razorpay from "razorpay";
import { logger } from "../utils/logger.js";

// Initialize only if keys exist to prevent server crash
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    logger.warn("Razorpay keys are missing. Payment features will be disabled.");
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

export const createRazorpayOrder = async (amount: number) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      throw new Error("Payment system is not configured. Please add Razorpay keys.");
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error: any) {
    logger.error(`Razorpay Order Error: ${error.message}`);
    throw error;
  }
};

export const verifyPayment = (order_id: string, payment_id: string, signature: string) => {
  try {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "");
    hmac.update(order_id + "|" + payment_id);
    const generated_signature = hmac.digest("hex");
    
    return generated_signature === signature;
  } catch (err) {
    return false;
  }
};
