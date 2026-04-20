import dotenv from "dotenv"
//edit from ameen
dotenv.config()
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import usermodel from './models/User_model.js';
import promodel from './models/Product_model.js';
import categorymodel from './models/category.model.js';
import CategoryRouter from "./routes/category.route.js"
import ProductRouter from  "./routes/product.route.js"
import AuthRouter from "./routes/auth.route.js"



const app = express();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB local'))
  .catch(err => console.error('Could not connect to MongoDB', err));




app.use(cors())
app.use(express.json())

app.use(CategoryRouter)
app.use(ProductRouter)
app.use(AuthRouter)















app.listen(5000, () => {
  console.log("Server running on http://localhost:5000/api/products");
})
