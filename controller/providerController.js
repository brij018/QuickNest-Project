import Provider from "../model/Provider.js";
import User from "../model/User.js";
import HttpError from "../middleware/HttpError.js";

const becomeProvider = async (req, res, next) => {
  try {
    const { services } = req.body;

    if (!services || services.length === 0) {
      return next(
        new HttpError("Provider must select at least one service", 400),
      );
    }

    const existing = await Provider.findOne({ userId: req.user._id });
    if (existing) {
      return next(
        new HttpError("You are already registered as a provider", 400),
      );
    }

    const newProvider = new Provider({ userId: req.user._id, services });
    await newProvider.save();

    await User.findByIdAndUpdate(req.user._id, { role: "provider" });

    res.status(201).json({
      success: true,
      message:
        "You successfully registered as a provider. Await admin verification before receiving bookings.",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

export default { becomeProvider };
