const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const Team = require("../models/Team");

// Create Team (coach only)
router.post("/", auth, requireRole("coach"), async (req, res) => {
  try {
    const team = new Team({ ...req.body, coach: req.user.id });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: "Error creating team" });
  }
});

// Get all teams
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("coach", "name email")
      .populate("tournament", "name")
      .populate("players", "name email role");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Error getting teams" });
  }
});

// Get team by ID
router.get("/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("coach", "name")
      .populate("tournament", "name")
      .populate("players", "name email");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Error fetching team" });
  }
});

// Update team (only by coach)
router.put("/:id", auth, requireRole("coach"), async (req, res) => {
  try {
    const updated = await Team.findOneAndUpdate(
      { _id: req.params.id, coach: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(403).json({ message: "Forbidden or not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating team" });
  }
});

// Delete team (only by coach)
router.delete("/:id", auth, requireRole("coach"), async (req, res) => {
  try {
    const deleted = await Team.findOneAndDelete({ _id: req.params.id, coach: req.user.id });
    if (!deleted) return res.status(403).json({ message: "Forbidden or not found" });
    res.json({ message: "Team deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting team" });
  }
});

module.exports = router;