import express from "express";

import { PostOrder,GetOrder,UpdateOrderStatus,getSingleOrder,cashfreeWebhook} from "../controller/order.controller.js"
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/api/order",authMiddleware, PostOrder)
router.get("/api/order",authMiddleware,GetOrder)
router.put("/api/order/:id",authMiddleware,UpdateOrderStatus)
router.get("/api/order/:id",getSingleOrder);
router.post("/api/cashfree/webhook",cashfreeWebhook);

export default router

