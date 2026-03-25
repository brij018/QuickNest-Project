import User from "../model/User.js";
import HttpError from "../middleware/HttpError.js";

const add = async (req, res, next) => {
  try {
    const { name, email, password, number, role } = req.body;
    const newUser = {
      name,
      email,
      password,
      number,
      role,
    };
    const user = new User(newUser);
    await user.save();

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

export default add;
