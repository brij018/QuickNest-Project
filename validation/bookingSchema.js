import Joi from "joi";

const bookingSchema = Joi.object({
  serviceId: Joi.string().trim().label("Service ID").messages({
    "string.base": "Service ID must be a string",
    "string.empty": "Service ID is required",
  }),

  bookingDate: Joi.date().label("Booking Date").messages({
    "date.base": "Booking date must be a valid date",
  }),

  timeSlot: Joi.string()
    .valid(
      "9:00-10:00",
      "10:00-11:00",
      "11:00-12:00",
      "12:00-13:00",
      "13:00-14:00",
      "14:00-15:00",
      "15:00-16:00",
      "16:00-17:00",
      "17:00-18:00",
    )
    .label("Time Slot")
    .messages({
      "any.only": "Invalid time slot selected",
      "string.empty": "Time slot is required",
    }),

  notes: Joi.string().max(500).trim().label("Notes").messages({
    "string.base": "Notes must be a string",
    "string.max": "Notes cannot exceed 500 characters",
  }),
});

export const createBookingSchema = bookingSchema
  .fork(["serviceId", "bookingDate", "timeSlot"], (field) => field.required())
  .fork(["notes"], (field) => field.optional())
  .messages({
    "any.required": "{#label} is required",
  });
