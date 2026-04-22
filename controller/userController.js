import User from "../model/User.js";
import Provider from "../model/Provider.js";
import HttpError from "../middleware/HttpError.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";

const generateToken = async (user) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  user.tokens = user.tokens.concat({ token });

  await user.save();

  return token;
};

const add = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const newUser = {
      name,
      email,
      password,
      phone,
      profilePic: req.file?.path,
      cloudinaryId: req.file?.filename,
    };

    console.log("cloudinaryId", newUser.cloudinaryId);

    const user = new User(newUser);

    await user.save();

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByCredentials(email, password);
    const token = await generateToken(user);
    if (!user) {
      return next(new HttpError("unable to login!!"));
    }

    res.status(200).json({ success: true, user, token });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const logOut = async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter((t) => t.token !== req.token);
    await req.user.save();
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const logoutAll = async (req, res, next) => {
  try {
    req.user.tokens = [];

    await req.user.save();

    res.json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const allUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      return res.json({ success: false, message: "No user found" });
    }
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetedUserId = req.params.id || req.user._id;

    const user = await User.findById(targetedUserId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== user._id.toString()
    ) {
      return next(new HttpError("Unauthorized access", 401));
    }

    if (user.role === "provider") {
      await Provider.findOneAndDelete({ userId: user._id });
    }

    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId);
    }

    await User.deleteOne({ _id: user._id });

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const update = async (req, res, next) => {
  try {
    const targetedUserId = req.params.id || req.user._id;

    const user = await User.findById(targetedUserId);
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== user._id.toString()
    ) {
      return next(new HttpError("unauthorized access", 401));
    }

    let allowedUserFields = ["name", "password", "phone", "profilePic"];
    if (req.user.role === "admin") {
      allowedUserFields = [...allowedUserFields, "role", "isVerified"];
    }
    const { services, ...userBodyFields } = req.body;
    const userUpdates = Object.keys(userBodyFields);

    const invalidUserFields = userUpdates.filter(
      (field) => !allowedUserFields.includes(field),
    );

    if (invalidUserFields.length > 0) {
      return next(
        new HttpError(`Invalid field(s): ${invalidUserFields.join(", ")}`, 400),
      );
    }

    userUpdates.forEach((field) => (user[field] = userBodyFields[field]));

    if (req.file) {
      if (user.cloudinaryId) {
        await cloudinary.uploader.destroy(user.cloudinaryId);
      }
      user.profilePic = req.file.path;
      user.cloudinaryId = req.file.filename;
    }

    await user.save();

    let updateProvider = null;

    if (services !== undefined) {
      if (user.role !== "provider") {
        return next(new HttpError("Only providers can update services", 403));
      }
      if (!Array.isArray(services) || services.length === 0) {
        return next(new HttpError("Services must be a non-empty array", 400));
      }
      updatedProvider = await Provider.findOneAndUpdate(
        { userId: user._id },
        { services },
        { new: true, runValidators: true },
      );

      if (!updatedProvider) {
        return next(new HttpError("Provider profile not found", 404));
      }
    }

    res.status(200).json({
      success: true,
      message: "user Data updated successfully",
      user,
      ...(updatedProvider && { provider: updatedProvider }),
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

export default { add, login, logOut, logoutAll, allUsers, deleteUser, update };
