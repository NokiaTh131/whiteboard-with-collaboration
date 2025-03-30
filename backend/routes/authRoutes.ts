import express from "express";
import { AuthController } from "../controllers/authController";

const router = express.Router();
const authController = new AuthController();

// User registration route
router.post("/register", (req, res) => authController.register(req, res));

// User login route
router.post("/login", (req, res) => authController.login(req, res));

// Password reset request route
router.post("/forgot-password", (req, res) =>
  authController.forgotPassword(req, res)
);

// Password reset route
router.post("/reset-password", (req, res) =>
  authController.resetPassword(req, res)
);

export default router;
