import HttpError from "./HttpError.js";

const checkRole =
  (...roles) =>
  (req, res, next) => {
    const user = req.user;
    if (!roles.includes(user.role)) {
      return next(new HttpError("Access Denied", 403));
    }
    next();
  };

export default checkRole;
