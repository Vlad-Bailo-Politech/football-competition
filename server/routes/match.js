module.exports = (io) => {
  const express = require("express");
  const router = express.Router();
  const auth = require("../middleware/auth");
  const optionalAuth = require("../middleware/optionalAuth");
  const requireRole = require("../middleware/role");
  const Match = require("../models/Match");

  // Публічний перегляд всіх матчів
  router.get("/", optionalAuth, async (req, res) => {
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

  // Публічний перегляд одного матчу
  router.get("/:id", optionalAuth, async (req, res) => {
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

  // Створення матчу (тільки для організатора)
  router.post("/", auth, requireRole("organizer"), async (req, res) => {
    try {
      const match = new Match(req.body);
      await match.save();
      io.emit("matchCreated", match);
      res.status(201).json(match);
    } catch (err) {
      res.status(500).json({ message: "Error creating match" });
    }
  });

  // Оновлення матчу (організатор або рефері)
  router.put("/:id", auth, requireRole(["organizer", "referee"]), async (req, res) => {
    try {
      const updated = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: "Match not found" });
      io.emit("matchUpdated", updated);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Error updating match" });
    }
  });

  // Введення рахунку (організатор або рефері)
  router.put("/:id/score", auth, requireRole(["organizer", "referee"]), async (req, res) => {
    const { scoreA, scoreB } = req.body;
    try {
      const match = await Match.findById(req.params.id);
      if (!match) return res.status(404).json({ message: "Match not found" });

      match.scoreA = scoreA;
      match.scoreB = scoreB;
      await match.save();

      io.emit("scoreUpdated", match);
      res.json({ message: "Score updated", match });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Видалення матчу (тільки організатор)
  router.delete("/:id", auth, requireRole("organizer"), async (req, res) => {
    try {
      const deleted = await Match.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Match not found" });
      io.emit("matchDeleted", { id: req.params.id });
      res.json({ message: "Match deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting match" });
    }
  });

  return router;
};
