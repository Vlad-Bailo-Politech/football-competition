const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const User = require("../models/User");
const Team = require("../models/Team");
const Match = require("../models/Match");
const multer = require("multer");

// Storage для аватарів
const playerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/players/"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${req.params.id}-${Date.now()}.${ext}`);
  }
});
const uploadPlayer = multer({ storage: playerStorage });

// Завантаження аватара гравця
router.post(
  "/:id/avatar",
  auth,
  requireRole("coach"), // або дозволити самому гравцю?
  uploadPlayer.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user || user.role !== "player")
        return res.status(404).json({ message: "Player not found" });

      // Опціонально: перевірити, що тренер цього гравця
      user.avatarUrl = `${req.protocol}://${req.get("host")}/uploads/players/${req.file.filename}`;
      await user.save();
      res.json({ message: "Avatar uploaded", avatarUrl: user.avatarUrl });
    } catch (err) {
      res.status(500).json({ message: "Error uploading avatar" });
    }
  }
);

// Публічний перегляд гравця
router.get("/:id", optionalAuth, async (req, res) => {
    try {
        const player = await User.findById(req.params.id);
        if (!player || player.role !== "player") {
            return res.status(404).json({ message: "Player not found" });
        }

        const team = await Team.findOne({ players: player._id }).populate("tournament");
        player.team = team;

        // Статистика (поки що кількість матчів команди)
        const matches = await Match.find({
            $or: [
                { teamA: team?._id },
                { teamB: team?._id }
            ]
        });

        let stats = {
            games: 0,
            wins: 0,
            draws: 0,
            losses: 0
        };

        for (let match of matches) {
            if (match.scoreA == null || match.scoreB == null) continue;

            const isTeamA = String(match.teamA) === String(team._id);
            const scoreSelf = isTeamA ? match.scoreA : match.scoreB;
            const scoreOpp = isTeamA ? match.scoreB : match.scoreA;

            stats.games += 1;
            if (scoreSelf > scoreOpp) stats.wins += 1;
            else if (scoreSelf < scoreOpp) stats.losses += 1;
            else stats.draws += 1;
        }

        res.json({ player, stats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Публічний рейтинг гравців
router.get("/ranking", optionalAuth, async (req, res) => {
    try {
        const players = await User.find({ role: "player" });
        const teams = await Team.find().populate("tournament").populate("players");

        const matches = await Match.find().lean();

        const data = [];

        for (let player of players) {
            const team = teams.find(t => t.players.some(p => String(p._id) === String(player._id)));

            if (!team) continue;

            const teamMatches = matches.filter(
                m =>
                    String(m.teamA) === String(team._id) ||
                    String(m.teamB) === String(team._id)
            );

            let stats = { games: 0, wins: 0, draws: 0, losses: 0 };

            for (let match of teamMatches) {
                if (match.scoreA == null || match.scoreB == null) continue;

                const isTeamA = String(match.teamA) === String(team._id);
                const scoreSelf = isTeamA ? match.scoreA : match.scoreB;
                const scoreOpp = isTeamA ? match.scoreB : match.scoreA;

                stats.games += 1;
                if (scoreSelf > scoreOpp) stats.wins += 1;
                else if (scoreSelf < scoreOpp) stats.losses += 1;
                else stats.draws += 1;
            }

            data.push({
                _id: player._id,
                name: player.name,
                team: { name: team.name },
                stats
            });
        }

        // Сортування за кількістю перемог
        data.sort((a, b) => b.stats.wins - a.stats.wins);

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;