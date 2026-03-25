import express from "express";

import add from "../controller/userController.js";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/add", add);

export default router;
