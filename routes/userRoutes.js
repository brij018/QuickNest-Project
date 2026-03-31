import express from "express";

import userManager from "../controller/userController.js";
import validate from "../middleware/validate.js";
import registerSchema from "../validation/registerSchema.js";
import auth from "../middleware/auth.js";
import checkRole from "../middleware/roleAccess.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/register",
  upload.single("cloudinaryId"),
  validate(registerSchema),
  userManager.add,
);

router.post("/login", auth, userManager.login);

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

export default router;
