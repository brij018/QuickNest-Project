import jwt from "jsonwebtoken";
import HttpError from "./HttpError.js";
import User from "../model/User.js";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new HttpError("Authentication required", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.userId,
      "tokens.token": token,
    });

    if (!user) {
      return next(new HttpError("Authentication failed", 401));
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    next(new HttpError("Invalid or expired token", 401));
  }
};

export default auth;
