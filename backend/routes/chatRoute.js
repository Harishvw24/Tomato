import express from "express";
import optionalAuth from "../middleware/optionalAuth.js";
import { chat } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/message", optionalAuth, chat);

export default chatRouter;