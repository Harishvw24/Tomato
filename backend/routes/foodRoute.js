import express from "express";
import multer from "multer";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import authMiddleware from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

const foodRouter = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter
});

foodRouter.get("/list", listFood);

foodRouter.post(
  "/add",
  authMiddleware,
  requireRole("admin"),
  upload.single("image"),
  addFood
);

foodRouter.post(
  "/remove",
  authMiddleware,
  requireRole("admin"),
  removeFood
);

export default foodRouter;
