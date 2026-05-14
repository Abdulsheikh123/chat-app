import express from "express";
import { otpRateLimit } from "../middlewares/rateLimit.middleware";
import { sendOTPController, verifyOTPController } from "../controllers/otp.controller";

const router = express.Router();

router.post(
  "/send-otp",
  otpRateLimit, // 👈 FIRST protection layer
  sendOTPController
);

router.post(
  "/verify-otp",
  // rate limit optional here
 verifyOTPController
);


export default router;