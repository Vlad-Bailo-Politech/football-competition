const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const Match = require("../models/Match");

// Create match (organizer)
router.post("/", auth, requireRole("organizer"), async (req, res) => {
    try {
        const match = new Match(req.body);
        await match.save();
        res.status(201).json(match);
    } catch (err) {
        res.status(500).json({ message: "Error creating match" });
    }
});

// Get all matchs
router.get("/", auth, async (req, res) => {
    try {
        const matches = await Match.find()
            .populate("teamA", "name")
            .populate("teamB", "name")
            .populate("tournament", "name");
        res.json(matches);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get match by ID
router.get("/:id", async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate("teamA", "name")
            .populate("teamB", "name")
            .populate("tournament", "name");
        if (!match) return res.status(404).json({ message: "Match not found" });
        res.json(match);
    } catch (err) {
        res.status(500).json({ message: "Error fetching match" });
    }
});

// Update match (organizer only)
router.put("/:id", auth, requireRole("organizer"), async (req, res) => {
    try {
        const updated = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Match not found" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Error updating match" });
    }
});

// Delete match
router.delete("/:id", auth, requireRole("organizer"), async (req, res) => {
    try {
        const deleted = await Match.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Match not found" });
        res.json({ message: "Match deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting match" });
    }
});

// Update score
router.put("/:id/score", auth, requireRole(["organizer", "referee"]), async (req, res) => {
  const { scoreA, scoreB } = req.body;
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.scoreA = scoreA;
    match.scoreB = scoreB;
    await match.save();

    res.json({ message: "Score updated", match });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
