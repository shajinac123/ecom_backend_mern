import express from "express";

import { PostOrder} from "../controller/order.controller.js"
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/api/order",authMiddleware, PostOrder)

export default router