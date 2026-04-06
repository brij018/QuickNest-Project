import User from "../model/User.js";
import HttpError from "../middleware/HttpError.js";
import cloudinary from "../config/cloudinary.js";

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    await cloudinary.uploader.destroy(user.cloudinaryId);

    res
      .status(200)
      .json({ success: true, message: "user data deleted successfully" });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const updateUserData = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    const updates = Object.keys(req.body);

    const allowedFields = [
      "name",
      "email",
      "password",
      "phone",
      "role",
      "profilePic",
      "isVerified",
    ];
    const isValid = updates.every((field) => allowedFields.includes(field));
    if (!isValid) {
      return next(new HttpError("only allowed field can be updated", 400));
    }
    updates.forEach((update) => (user[update] = req.body[update]));
    if (req.file) {
      await cloudinary.uploader.destroy(user.cloudinaryId);
      user.profilePic = req.file.path;
      user.cloudinaryId = req.file.filename;
    }
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "user data updated successfully", user });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

export default { updateUserData, deleteUser };
