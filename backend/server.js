//Load environment variables
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

console.log("Cloudinary env present:", {
    CLOUDINARY_CLOUD_NAME: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: Boolean(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET),
});

import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRouter.js"
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

//App Configuration

const app=express()
const port = process.env.PORT || 4000

//middleware

app.use(express.json())
app.use(cors())

//MongoDB connection

connectDB();

//api end-points

app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)

app.get("/",(req,res)=>{
    res.send("Hari your backend server is working")
})

app.listen(port,"0.0.0.0",()=>{
    console.log(`Server started on http://localhost:${port}`)
})

//mongodb+srv://hari:ZFCoP8THmzdZNjs1@cluster0.wb3zv7j.mongodb.net/?
