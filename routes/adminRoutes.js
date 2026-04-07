import express from "express";

import auth from "../middleware/auth.js";
import checkRole from "../middleware/roleAccess.js";
import userManager from "../controller/userController.js";
import categoryManager from "../controller/categoryController.js";
import validate from "../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validation/categotySchema.js";

const router = express.Router();

router.get("/allUser", auth, checkRole("admin"), userManager.allUsers);

router.patch("/update/:id", auth, checkRole("admin"), userManager.update);

router.delete("/delete/:id", auth, checkRole("admin"), userManager.deleteUser);

router.post(
  "/addCategory",
  auth,
  checkRole("admin"),
  validate(createCategorySchema),
  categoryManager.add,
);
router.get(
  "/getAllCategory",
  auth,
  checkRole("admin"),
  categoryManager.getAllCategories,
);
router.patch(
  "/updateCategory/:id",
  auth,
  checkRole("admin"),
  validate(updateCategorySchema),
  categoryManager.updateCategory,
);
router.delete(
  "/deleteCategory/:id",
  auth,
  checkRole("admin"),
  categoryManager.deleteCategory,
);

export default router;
