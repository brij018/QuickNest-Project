import express from "express";
import bookingManager from "../controller/bookingCategory.js";
import userManager from "../controller/userController.js";
import validate from "../middleware/validate.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../validation/registerSchema.js";
import { createBookingSchema } from "../validation/bookingSchema.js";
import auth from "../middleware/auth.js";
import checkRole from "../middleware/roleAccess.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/register",
  upload.single("profilePic"),
  validate(createUserSchema),
  userManager.add,
);

router.post("/login", userManager.login);

router.get("/profile", auth, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

router.post("/logOut", auth, userManager.logOut);
router.post("/logOutAll", auth, userManager.logoutAll);
router.get("/allUser", auth, checkRole("admin"), userManager.allUsers);
router.patch(
  "/update",
  auth,
  upload.single("profilePic"),
  validate(updateUserSchema),
  userManager.update,
);
router.delete("/delete", auth, userManager.deleteUser);

router.post(
  "/createBooking",
  auth,
  validate(createBookingSchema),
  bookingManager.add,
);

router.get("/getAllBookings", auth, bookingManager.getAllBookings);
router.delete("/deleteBooking", auth, bookingManager.deleteBooking);

export default router;
