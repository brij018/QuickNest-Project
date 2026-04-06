import express from "express";

import userManager from "../controller/userController.js";
import validate from "../middleware/validate.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../validation/registerSchema.js";
import auth from "../middleware/auth.js";
import checkRole from "../middleware/roleAccess.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/register",
  (req, res, next) => {
    console.log("STEP 1: ROUTE HIT");
    next();
  },
  upload.single("profilePic"),
  (req, res, next) => {
    console.log("STEP 2: AFTER MULTER");
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    next();
  },
  validate(createUserSchema),
  (req, res, next) => {
    console.log("STEP 3: AFTER VALIDATION");
    next();
  },
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

export default router;
