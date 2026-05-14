import { redis } from "../config/redis";

/**
 * Generate 6 digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
 
export const sendOTPService = async (number: string) => {
  try {
    // generate otp
    const otp = generateOTP();

    /**
     * Store OTP in Redis
     * key = otp:1234567890
     * value = 123456
     * EX = expiry time
     * 300 = 5 minutes
     */
    await redis.set(`otp:${number}`, otp, "EX", 300);

    // temporary console (later email/sms send)
    console.log(`OTP for ${number}: ${otp}`);

    return {
      success: true,
      message: "OTP sent successfully",
      otp, // 👈 Added for frontend toast
    };

  } catch (error) {
    throw new Error("FAILED_TO_SEND_OTP");
  }
};

/**
 * Verify OTP Service
 */
export const verifyOTPService = async (
  number: string,
  otp: string
) => {
  try {
    // get stored otp from redis
    const storedOTP = await redis.get(`otp:${number}`);

    // check otp exists or expired
    if (!storedOTP) {
      throw new Error("OTP_EXPIRED");
    }

    // compare otp
    if (storedOTP !== otp) {
      throw new Error("INVALID_OTP");
    }

    // delete otp after successful verification
    await redis.del(`otp:${number}`);

    return {
      success: true,
      message: "OTP verified successfully",
    };

  } catch (error) {
    throw error;
  }
};