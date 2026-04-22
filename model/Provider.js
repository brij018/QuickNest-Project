import mongoose from "mongoose";
import { type } from "node:os";

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

providerSchema.pre("save", function (next) {
  if (!this.services || this.services.length === 0) {
    return next(new Error("Provider must select at least one service"));
  }
  next();
});

const Provider = mongoose.model("Provider", providerSchema);

export default Provider;
