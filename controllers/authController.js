import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ✅ Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =============================
// 📌 Register with email/password
// =============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User already exists" });

    // create new user
    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

// =============================
// 📌 Login with email/password
// =============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};

// =============================
// 📌 Get Profile (protected)
// =============================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Profile error:", err.message);
    res.status(500).json({ error: "Profile fetch failed" });
  }
};

// =============================
// 📌 Google Login
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
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8),
        avatar: picture,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("❌ Google login error:", err.message);
    res.status(500).json({ error: "Google login failed" });
  }
};

