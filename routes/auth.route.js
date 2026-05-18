import express from "express";
import { LoginUser, RegisterUser,GetUser } from "../controller/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";



const router = express.Router();
  

router.post("/register",RegisterUser)
router.post("/login",LoginUser)
router.get("/users/:id",authMiddleware,GetUser)


export default router