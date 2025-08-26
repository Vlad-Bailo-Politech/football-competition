const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const User = require("../models/User");

const router = express.Router();

// Всі маршрути під /api/users/* доступні лише авторизованим користувачам
router.use(auth);

/**
 * GET /api/users
 * Отримати список користувачів за роллю
 * Параметри: ?role=coach або ?role=player
 */
router.get("/", async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const users = await User.find({ role }).select("_id name");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports = router;
