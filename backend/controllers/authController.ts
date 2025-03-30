import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {
  // User registration
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        res.status(400).json({
          message: "User already exists",
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        username,
        email,
        passwordHash,
      });

      await newUser.save();

      // Generate JWT token
      const token = this.generateToken(newUser);

      res.status(201).json({
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({
        message: "Registration failed",
        error,
      });
    }
  }

  // User login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        res.status(401).json({
          message: "Invalid credentials",
        });
        return;
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        res.status(401).json({
          message: "Invalid credentials",
        });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);

      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({
        message: "Login failed",
        error,
      });
    }
  }

  // Password reset request
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      // Generate password reset token
      const resetToken = this.generateResetToken(user);

      // TODO: Send reset email with resetToken
      // In a real-world scenario, you'd send an email with a reset link

      res.json({
        message: "Password reset token generated",
      });
    } catch (error) {
      res.status(500).json({
        message: "Password reset request failed",
        error,
      });
    }
  }

  // change password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      // Verify reset token
      const decoded = jwt.verify(
        token,
        process.env.JWT_RESET_SECRET || "reset_secret"
      ) as { userId: string };

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(400).json({
          message: "Invalid reset token",
        });
        return;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);

      await user.save();

      res.json({
        message: "Password reset successful",
      });
    } catch (error) {
      res.status(500).json({
        message: "Password reset failed",
        error,
      });
    }
  }

  // Generate JWT token
  private generateToken(user: any) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      {
        expiresIn: "24h",
      }
    );
  }

  // Generate password reset token
  private generateResetToken(user: any) {
    return jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_RESET_SECRET || "reset_secret",
      {
        expiresIn: "1h",
      }
    );
  }
}
