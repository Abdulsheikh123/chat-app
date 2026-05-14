
 import { Request, Response } from "express";
import {
  sendOTPService,
  verifyOTPService,
} from "../services/otp.service";
import { logger } from "../utils/logger";

/**
 * Send OTP Controller
 */
export const sendOTPController = async (
  req: Request,
  res: Response
) => {
  try {
    const { number } = req.body;


    logger.info(`Send OTP request for: ${number}`);
    // call service
    const result = await sendOTPService(number);

     // success log
    logger.info(`OTP sent successfully to: ${number}`);

    return res.status(200).json(result);

  } catch (error: any) {
    if (error.message === "FAILED_TO_SEND_OTP") {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Verify OTP Controller
 */
export const verifyOTPController = async (
  req: Request,
  res: Response
) => {
  try {
    const { number, otp } = req.body;

    // call service
    const result = await verifyOTPService(number, otp);

    return res.status(200).json(result);

  } catch (error: any) {

    if (error.message === "OTP_EXPIRED") {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (error.message === "INVALID_OTP") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};