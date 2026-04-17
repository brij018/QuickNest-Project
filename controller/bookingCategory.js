import Service from "../model/Service.js";
import User from "../model/User.js";

import HttpError from "../middleware/HttpError.js";
import Booking from "../model/Booking.js";

const add = async (req, res, next) => {
  try {
    const { serviceId, bookingDate, timeSlot, notes } = req.body;

    const userId = req.user._id;

    const service = await Service.finDbyId(serviceId);

    if (!service) {
      return next(new HttpError("service not found", 404));
    }

    if (!service.isActive) {
      return next(
        new HttpError(
          "Service is currently not active, please try again later",
          400,
        ),
      );
    }

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      serviceId,
      timeSlot,
      bookingDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingBooking) {
      return next(
        new HttpError("service already booked for this time slot ", 409),
      );
    }

    const newBooking = new Booking({
      userId,
      serviceId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      notes,
      price: service.price,
    });

    await newBooking.save();

    await newBooking.populate("serviceId");

    await newBooking.populate("userId");

    res.status(201).json({
      success: true,
      message: "service booked successfully",
      newBooking,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new HttpError("Booking not found", 404));
    }

    if (booking.userId.toString() !== userId.toString()) {
      return next(new HttpError("Unauthorized to delete this booking", 403));
    }

    if (booking.status === "completed") {
      return next(new HttpError("Completed bookings cannot be deleted", 400));
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    let bookings;

    const role = req.user.role;

    if (role === "admin") {
      bookings = await Booking.find({}).populate([
        {
          path: "serviceId",
          select: "name price duration notes",
        },
        {
          path: "userId",
          service: "name email phone",
        },
      ]);
    } else if (role === "customer") {
      bookings = await Booking.find({ userId: req.user._id }).populate(
        "serviceId",
        "name price duration notes",
      );
    } else {
      return next(new HttpError("unAuthorized access", 401));
    }
    if (bookings.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "no booking data found" });
    }

    res.status(200).json({
      success: true,
      message: "all bookings fetched",
      bookings,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const getAllBookingsByServiceId = async (req, res, next) => {
  try {
    let bookings;

    const role = req.user.role;

    if (role === "admin") {
      bookings = await Booking.find({ serviceId: req.params.id }).populate([
        {
          path: "serviceId",
          service: "name price duration notes",
        },
        {
          path: "userId",
          service: "name email phone",
        },
      ]);
    } else if (role === "customer") {
      bookings = await Booking.find({
        serviceId: req.params.id,
        userId: req.user._id,
      }).populate("serviceId", "name price duration notes");
    } else {
      return next(new HttpError("unAuthorized access", 401));
    }
    if (bookings.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "no booking data found" });
    }
    res.status(200).json({
      success: true,
      message: "all bookings fetched",
      bookings,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const getBookingsByUserId = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({ userId });
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    const bookings = await Booking.find({ userId }).populate([
      {
        path: "serviceId",
        service: "name price duration notes",
      },
      {
        path: "userId",
        service: "name email phone",
      },
    ]);

    if (bookings.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "This user has no bookings" });
    }

    res.status(200).json({
      success: true,
      message: "Bookings data fetched successfully",
      bookings,
    });
  } catch (error) {
    next(new HttpError("internal server error", 500));
  }
};

const ShowAvailableSlots = async (req, res, next) => {
  try {
    const { serviceId, bookingDate } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        message: "serviceId and booking date are required",
      });
    }

    const service = await Service.finDbyId(serviceId);

    if (!service.isActive) {
      return next(
        new HttpError(
          "Service is currently not active, please try again later",
          400,
        ),
      );
    }

    const allSlots = [
      "9:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "12:00-13:00",
      "13:00-14:00",
      "14:00-15:00",
      "15:00-16:00",
      "16:00-17:00",
      "17:00-18:00",
    ];

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const EndOfDay = new Date(bookingDate);
    EndOfDay.setHours(24, 59, 59, 999);

    const bookings = await Booking.find({
      serviceId,
      bookingDate: { $gte: startOfDay, $lt: EndOfDay },
      status: { $in: ["pending", "confirmed"] },
    }).select("timeSlot");

    const bookedSlots = bookings.map((t) => b.timeSlot);

    const availableSlots = allSlots.filter((t) => !bookedSlots.includes(t));

    if (availableSlots.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Time Slot Available At This Moment",
      });
    }

    res.status(200).json({
      success: true,
      message: "Available Time Slots : ",
      availableSlots,
    });
  } catch (error) {}
};

export default {
  add,
  deleteBooking,
  getAllBookings,
  getAllBookingsByServiceId,
  getBookingsByUserId,
};
