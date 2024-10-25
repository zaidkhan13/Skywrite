import express from "express";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fetchUser from "../middlewares/fetchuser.js";

// Load environment variables (e.g., JWT_SECRET) from the .env.local file
dotenv.config({ path: ".env.local" });

const router = express.Router();
const secret = process.env.JWT_SECRET;

// Route 1: Create a User using POST "/api/auth/createuser" - No login required
router.post(
  "/createuser",
  [
    // Validate user input
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);

      // Check for validation errors and return if any
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      // Check if user with the same email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ message: "Email already exists!" });
      }

      // Hash the password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const securedPass = await bcrypt.hash(req.body.password, salt);

      // Create and save the new user in the database
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securedPass,
      });

      // Create a JWT token for the user
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, secret);

      // Send a success response with the token
      res
        .status(201)
        .json({ message: "User created successfully!", authToken });
    } catch (error) {
      res.status(400).json({ message: "Internal Server Error!", error });
    }
  }
);

// Route 2: Authenticate a User using POST "/api/auth/login" - No login required
router.post(
  "/login",
  [
    // Validate login credentials
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").exists().withMessage("Password cannot be empty"),
  ],
  async (req, res) => {
    try {
      const result = validationResult(req);

      // Check for validation errors and return if any
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { email, password } = req.body;

      // Check if user exists with the provided email
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ message: "Try to log in again with correct credentials!" });
      }

      // Compare provided password with the stored hashed password
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) {
        return res
          .status(400)
          .json({ message: "Try signing in again with correct credentials!" });
      }

      // Create JWT token after successful login
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, secret);

      // Send a success response with the token
      res.status(201).json({ message: "Logged in successfully!", authToken });
    } catch (error) {
      res.status(400).json({ message: "Internal Server Error!", error });
    }
  }
);

// Route 3: Get logged in User details using GET "/api/auth/getuser" - Login required
router.get("/getuser", fetchUser, async (req, res) => {
  try {
    // Retrieve user ID from the JWT (set by fetchUser middleware)
    const userId = req.user.id;

    // Find user by ID and exclude the password field from the response
    const user = await User.findById(userId).select("-password");

    // Send the user details as a response
    res.status(201).send({ user });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error!", error });
  }
});

export default router;
