import express from "express";
import providerManager from "../controller/providerController.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { providerSchema } from "../validation/registerSchema.js";

const router = express.Router();

router.post(
  "/registerAsProvider",
  auth,
  validate(providerSchema),
  providerManager.becomeProvider,
);

export default router;
