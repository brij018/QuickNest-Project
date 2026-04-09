import express from "express";

import auth from "../middleware/auth.js";
import checkRole from "../middleware/roleAccess.js";
import userManager from "../controller/userController.js";
import categoryManager from "../controller/categoryController.js";
import serviceManager from "../controller/serviceController.js";
import validate from "../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validation/categorySchema.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validation/serviceSchema.js";

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
router.post(
  "/addService",
  auth,
  checkRole("admin"),
  validate(createServiceSchema),
  serviceManager.add,
);
router.get(
  "/getAllCategories",
  auth,
  checkRole("admin"),
  categoryManager.getAllCategories,
);
router.get(
  "/getAllServices",
  auth,
  checkRole("admin"),
  serviceManager.getAllServices,
);
router.patch(
  "/updateCategory/:id",
  auth,
  checkRole("admin"),
  validate(updateCategorySchema),
  categoryManager.updateCategory,
);
router.patch(
  "/updateService/:id",
  auth,
  checkRole("admin"),
  validate(updateServiceSchema),
  serviceManager.updateService,
);
router.delete(
  "/deleteCategory/:id",
  auth,
  checkRole("admin"),
  categoryManager.deleteCategory,
);
router.delete(
  "/deleteService/:id",
  auth,
  checkRole("admin"),
  serviceManager.deleteService,
);

export default router;
