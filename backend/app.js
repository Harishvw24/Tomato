import express from "express";
import cors from "cors";
import passport from "passport";

import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRouter.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatRouter from "./routes/chatRoute.js";

import "./config/passport.js";

const app = express();

const defaultOrigins = [
  "http://localhost:5180",
  "http://localhost:5181",
  "http://localhost:5173",
  "https://tomato-frontend2-lime.vercel.app"
];

const normalizeOrigin = (origin) => {
  if (!origin) {
    return "";
  }

  return origin.trim().replace(/\/+$/, "");
};

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.CUSTOMER_URL,
  process.env.ADMIN_URL,
  ...(process.env.CORS_ORIGINS || "").split(",")
];

const allowedOrigins = [...defaultOrigins, ...configuredOrigins]
  .filter(Boolean)
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error(`Origin is not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

app.use(passport.initialize());

app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/chat", chatRouter);
app.use("/images", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Food delivery backend is working"
  });
});

app.get("/health", (req, res) => {
  res.json({ success: true, status: "healthy" });
});

export default app;