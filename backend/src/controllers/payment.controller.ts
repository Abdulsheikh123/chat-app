import { Response } from "express";
import { createRazorpayOrder, verifyPayment } from "../services/payment.service.js";
import { logger } from "../utils/logger.js";

export const createOrder = async (req: any, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const order = await createRazorpayOrder(amount);
    
    return res.status(200).json({
      success: true,
      order
    });
  } catch (error: any) {
    logger.error(`Payment Controller Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const handlePaymentVerify = async (req: any, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (isValid) {
      // Here you would typically update the user's balance in the database
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};
