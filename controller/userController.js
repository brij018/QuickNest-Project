import User from "../model/User.js";
import HttpError from "../middleware/HttpError.js";
import jwt from "jsonwebtoken";

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
    const { name, email, password, phone, role } = req.body;
    const newUser = {
      name,
      email,
      password,
      phone,
      role,
      cloudinaryId: req.file?.path,
    };
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

    if (!user) {
      return next(new HttpError("unable to login!!"));
    }

    res.status(200).json({ success: true, user });
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

export default { add, login, logOut, logoutAll, allUsers };
