import express from "express";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./config/db.js";
import HttpError from "./middleware/HttpError.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();
app.use(express.json());
app.set("view engine", "ejs");

app.use("/user", userRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.render("home");
});

app.use((req, res, next) => {
  next(new HttpError("Route Not Found", 404));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.statusCode || 500)
    .json(error.message || "Internal server error");
});

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log("server is running on port", port);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

startServer();
