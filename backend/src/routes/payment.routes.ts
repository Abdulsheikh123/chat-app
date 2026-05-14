import { Router } from "express";
import { createOrder, handlePaymentVerify } from "../controllers/payment.controller.js";
import { protectAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/order", protectAuth, createOrder);
router.post("/verify", protectAuth, handlePaymentVerify);

export default router;
