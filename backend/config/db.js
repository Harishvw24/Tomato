import mongoose from "mongoose";

export const connectDB = async ()=>{
    await mongoose.connect('mongodb+srv://hari:ZFCoP8THmzdZNjs1@cluster0.wb3zv7j.mongodb.net/food-del').then(()=>{
        console.log("MongoDB is connected");
    })
}