import express from "express";

import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

import { createBookingSchema } from "../validation/bookingSchema.js";

import bookingManager from "../controller/bookingCategory.js";

const router = express.Router();

router.post("/create", auth, validate(createBookingSchema), bookingManager.add);

router.get("/getAllBookings", auth, bookingManager.getAllBookings);

router.get(
  "/getAllBookingsByServiceId/:id",
  auth,
  bookingManager.getAllBookingsByServiceId,
);

router.delete("/deleteBooking", auth, bookingManager.deleteBooking);

export default router;
