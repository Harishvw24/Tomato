import express from "express";
import jwt from "jsonwebtoken";
import {
  registerUser,
  loginUser,
  googleCallback,
  getCurrentUser
} from "../controllers/userController.js";
import passport, { isGoogleOAuthConfigured } from "../config/passport.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

const requireGoogleOAuth = (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(503).json({
      success: false,
      message: "Google login is not configured on the server"
    });
  }

  next();
};

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/google", requireGoogleOAuth, (req, res, next) => {
  const requestedRole = ["customer", "admin"].includes(req.query.role)
    ? req.query.role
    : "customer";

  const state = jwt.sign(
    { requestedRole },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state
  })(req, res, next);
});

userRouter.get(
  "/google/callback",
  requireGoogleOAuth,
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CUSTOMER_URL}/login`
  }),
  googleCallback
);

userRouter.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

export default userRouter;