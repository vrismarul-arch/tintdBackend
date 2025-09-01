import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =============================
// Register user
// =============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User already exists" });

    const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

// =============================
// Login user
// =============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    // 🔹 Admin login from .env
    if (!user && email === process.env.ADMIN_EMAIL) {
      if (password === process.env.ADMIN_PASSWORD) {
        user = await User.create({
          name: "Admin",
          email,
          password, // hashed automatically
          role: "admin",
        });
      } else {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    }

    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};

// =============================
// Google login
// =============================
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8),
        avatar: picture,
        role,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Google login error:", err.message);
    res.status(500).json({ error: "Google login failed" });
  }
};

// =============================
// Get profile
// =============================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Profile fetch failed" });
  }
};
