
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      }
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    providerId: {
      type: String,
      sparse: true
    },

    cartData: {
      type: Object,
      default: {}
    }
  },
  {
    minimize: false
  }
);

const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;