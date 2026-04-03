import express from "express";

import auth from "../middleware/auth.js";
import checkRole from "../middleware/roleAccess.js";
import adminManager from "../controller/adminController.js";

const router = express.Router();

router.patch(
  "/update/:id",
  auth,
  checkRole("admin"),
  adminManager.updateUserData,
);

router.delete("/delete/:id", auth, checkRole("admin"), adminManager.deleteUser);

export default router;
