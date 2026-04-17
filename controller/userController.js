import User from "../model/User.js";
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
    const { name, email, password, phone, role, services } = req.body;
    const newUser = {
      name,
      email,
      password,
      phone,
      role,
      services: role === "provider" ? services : [],
      profilePic: req.file?.path,
      cloudinaryId: req.file?.filename,
    };

    if (role === "provider" && (!services || services.length === 0)) {
      return next(new HttpError("Providers must select services", 400));
    }

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
    const targetedUser = req.params.id || req.user._id;

    const user = await User.findById(targetedUser);
    if (!user) {
      return next(new HttpError("user not found", 404));
    }
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== user._id.toString()
    ) {
      return next(new HttpError("unauthorized access", 401));
    }
    await User.deleteOne(user);
    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId);
    }
    res
      .status(200)
      .json({ success: true, message: "user deleted successfully" });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const update = async (req, res, next) => {
  try {
    const targetedUser = req.user._id || req.params.id;
    const user = await User.findById(targetedUser);
    if (!user) {
      return next(new HttpError("user not found", 404));
    }
    const updates = Object.keys(req.body);

    const allowedFields = ["name", "password", "phone", "profilePic"];
    if (req.user.role === "admin") {
      allowedFields = [...allowedFields, "role", "isVerified"];
    }

    const isValid = updates.every((field) => allowedFields.includes(field));

    if (!isValid) {
      return next(new HttpError("only allowed field can be updated", 400));
    }
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== user._id.toString()
    ) {
      return next(new HttpError("unauthorized access", 401));
    }

    updates.forEach((update) => (user[update] = req.body[update]));

    if (req.file) {
      if (user.cloudinaryId) {
        await cloudinary.uploader.destroy(user.cloudinaryId);
      }
      user.profilePic = req.file.path;
      user.cloudinaryId = req.file.filename;
    }

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "user Data updated successfully", user });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

export default { add, login, logOut, logoutAll, allUsers, deleteUser, update };
