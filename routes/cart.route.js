import express from "express";
import { CreateCart,GetCart,removeCartItem, UpdateCart} from "../controller/cart.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/cart",authMiddleware, CreateCart)
router.get("/cart",authMiddleware, GetCart)
router.put("/cart", authMiddleware, UpdateCart);
router.delete("/cart/:id", authMiddleware, removeCartItem);

export default router