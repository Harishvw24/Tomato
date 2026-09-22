import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.token;

    if (token?.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch {
    // Menu search remains available when a guest has an expired token.
  }

  next();
};

export default optionalAuth;