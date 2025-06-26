const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const requireRole = require("../middleware/role");
const Team = require("../models/Team");
const multer = require("multer");

// Налаштування storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/teams/"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${req.params.id}-${Date.now()}.${ext}`);
  }
});
const upload = multer({ storage });

// Завантажити логотип команди
router.post(
  "/:id/logo",
  auth,
  requireRole("coach"),
  upload.single("logo"),
  async (req, res) => {
    try {
      const team = await Team.findById(req.params.id);
      if (!team) return res.status(404).json({ message: "Team not found" });
      if (team.coach.toString() !== req.user.id)
        return res.status(403).json({ message: "Forbidden" });

      team.logoUrl = `${req.protocol}://${req.get("host")}/uploads/teams/${req.file.filename}`;
      await team.save();
      res.json({ message: "Logo uploaded", logoUrl: team.logoUrl });
    } catch (err) {
      res.status(500).json({ message: "Error uploading logo" });
    }
  }
);

// Публічний перегляд всіх команд із пошуком
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    // Шукаємо по назві (регістронезалежно)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const teams = await Team.find(filter)
      .populate("coach", "name email")
      .populate("tournament", "name")
      .populate("players", "name email role");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Error getting teams" });
  }
});

// Публічний перегляд конкретної команди
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("coach", "name email")
      .populate("players", "name email")
      .populate("tournament", "name");

    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Створення команди (тільки тренер)
router.post("/", auth, requireRole("coach"), async (req, res) => {
  try {
    console.log('User ID:', req.user.id); // Додай
    console.log('Request body:', req.body); // Додай

    const team = new Team({ ...req.body, coach: req.user.id });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    console.error('Error creating team:', err); // Додай
    res.status(500).json({ message: "Error creating team" });
  }
});


// Додавання гравця (тільки тренер)
router.put("/:id/add-player", auth, requireRole("coach"), async (req, res) => {
  const { playerId } = req.body;

  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.coach.toString() !== req.user.id)
      return res.status(403).json({ message: "You can only modify your own team" });

    if (team.players.includes(playerId))
      return res.status(400).json({ message: "Player already in team" });

    team.players.push(playerId);
    await team.save();

    res.json({ message: "Player added", team });
  } catch (err) {
    res.status(500).json({ message: "Error adding player" });
  }
});

// Видалення гравця (тільки тренер)
router.put("/:id/remove-player", auth, requireRole("coach"), async (req, res) => {
  const { playerId } = req.body;

  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.coach.toString() !== req.user.id)
      return res.status(403).json({ message: "You can only modify your own team" });

    team.players = team.players.filter(id => id.toString() !== playerId);
    await team.save();

    res.json({ message: "Player removed", team });
  } catch (err) {
    res.status(500).json({ message: "Error removing player" });
  }
});

// Оновлення команди (тільки тренер)
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

// Видалення команди (тільки тренер)
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