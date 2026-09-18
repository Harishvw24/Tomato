import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const password = await bcrypt.hash("ChangeThisPassword123!", 10);

await userModel.updateOne(
  { email: "harishrb1401@gmail.com" },
  {
    $set: {
      name: "Hari",
      email: "harishrb1401@gmail.com",
      password:"Hari@123",
      role: "admin",
      provider: "local",
      cartData: {}
    }
  },
  {
    upsert: true
  }
);

console.log("Admin user created");
await mongoose.disconnect();