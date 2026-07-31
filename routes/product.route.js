import express from "express";
import { CreateProduct,GetAllProduct,DeleteProduct, GetProductById, UpdateProduct,GetProductByCategory, SearchBarProduct } from "../controller/product.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();

router.post("/api/product", CreateProduct)
router.get("/api/products", GetAllProduct);
router.put("/api/product/:id", UpdateProduct)
router.delete("/api/product/:id",DeleteProduct)
router.get("/api/product/:id",GetProductById)
router.get("/api/category/:id",GetProductByCategory)
router.get("/api/search/:key",SearchBarProduct)


export default router