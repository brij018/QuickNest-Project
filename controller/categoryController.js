import HttpError from "../middleware/HttpError.js";
import Category from "../model/Category.js";

const add = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newCategory = await Category.create({
      name,
      description,
    });
    res.status(201).json({ success: true, message: "new category added" });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    if (!category) {
      return next(new HttpError("category not found", 404));
    }
    await Category.deleteOne(category);
    res
      .status(200)
      .json({ success: true, message: "category deleted successfully" });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return next(new HttpError("category not found", 404));
    }

    if (name) category.name = name;
    if (description) category.description = description;

    await category.save();

    res.status(200).json({
      success: true,
      message: "category updated successfully",
      category,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

export default { add, deleteCategory, updateCategory, getAllCategories };
