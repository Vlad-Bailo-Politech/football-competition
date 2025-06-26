const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const requireRole = require("../middleware/role");
const Tournament = require("../models/Tournament");

// Публічний перегляд турнірів
router.get("/", optionalAuth, async (req, res) => {
    try {
        const tournaments = await Tournament.find().populate("organizer", "name email");
        res.json(tournaments);
    } catch (err) {
        res.status(500).json({ message: "Error getting tournaments" });
    }
});

// Публічний перегляд одного турніру
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("organizer", "name email");
    if (!tournament) return res.status(404).json({ message: "Not found" });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tournament" });
  }
});

// Створення турніру (тільки організатор)
router.post("/", auth, requireRole("organizer"), async (req, res) => {
  try {
    const tournament = new Tournament({ ...req.body, organizer: req.user.id });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: "Error creating tournament" });
  }
});

// Оновлення турніру (тільки організатор)
router.put("/:id", auth, requireRole("organizer"), async (req, res) => {
  try {
    const updated = await Tournament.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(403).json({ message: "Forbidden or not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating tournament" });
  }
});

// Видалення турніру (тільки організатор)
router.delete("/:id", auth, requireRole("organizer"), async (req, res) => {
  try {
    const deleted = await Tournament.findOneAndDelete(
      { _id: req.params.id, organizer: req.user.id }
    );
    if (!deleted) return res.status(403).json({ message: "Forbidden or not found" });
    res.json({ message: "Tournament deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting tournament" });
  }
});

module.exports = router;
