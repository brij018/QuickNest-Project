import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtual: true },
    toObject: { virtual: true },
  },
);

categorySchema.virtual("services", {
  ref: "Service",
  localField: "_id",
  foreignField: "category",
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
