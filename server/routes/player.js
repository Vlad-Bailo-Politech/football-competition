const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Team = require("../models/Team");
const Match = require("../models/Match");

// GET player by ID
router.get("/:id", auth, async (req, res) => {
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

module.exports = router;