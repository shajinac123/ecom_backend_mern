import express from "express";
import { createCategory,GetAllCategory,updateCategory,DeleteCategory, GetCtegoryById } from "../controller/category.controller.js";

const router = express.Router();

router.post("/api/category", createCategory)
router.get("/api/category", GetAllCategory);
router.put("/api/category/:id", updateCategory)
router.delete("/api/category/:id",DeleteCategory)
router.get("/api/categoryid/:id",GetCtegoryById)



export default router;