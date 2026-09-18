import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async ()=>{
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is not set");
    }
    await mongoose.connect(mongoUri).then(()=>{
        console.log("MongoDB is connected");
    })
}