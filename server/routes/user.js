const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// GET /api/users/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// захищений маршрут для організаторів
router.get("/admin-only", auth, requireRole("organizer"), (req, res) => {
  res.send("You are an organizer!");
});

module.exports = router;