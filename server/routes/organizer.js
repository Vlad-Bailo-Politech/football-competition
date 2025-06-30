// server/routes/organizer.js
const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Match = require("../models/Match");

const router = express.Router();

// Всі маршрути під /api/organizer/* доступні лише для організаторів
router.use(auth, requireRole("organizer"));

/**
 * POST /api/organizer/tournaments
 * Створити новий турнір
 */
router.post("/tournaments", async (req, res) => {
  try {
    const {
      name,
      gender,
      season,
      location,
      startDate,
      groupStage = false,
      groupLegs = 1,
      playoff = false
    } = req.body;

    const tour = new Tournament({
      name,
      gender,
      season,
      location,
      startDate,
      groupStage,
      groupLegs,
      playoff,
      organizer: req.user.id,
      teams: []   // спочатку без команд
    });

    await tour.save();
    res.status(201).json(tour);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating tournament" });
  }
});

/**
 * GET /api/organizer/tournaments
 * Вивести всі турніри поточного організатора
 */
router.get("/tournaments", async (req, res) => {
  try {
    const tours = await Tournament.find({ organizer: req.user.id });
    res.json(tours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tournaments" });
  }
});

/**
 * GET /api/organizer/tournaments/:id
 * Повернути один турнір (з командами)
 */
router.get("/tournaments/:id", async (req, res) => {
  try {
    const tour = await Tournament.findOne({
      _id: req.params.id,
      organizer: req.user.id
    }).populate("teams", "name");
    if (!tour) return res.status(404).json({ message: "Tournament not found" });
    res.json(tour);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tournament" });
  }
});

/**
 * PUT /api/organizer/tournaments/:id
 * Оновити поля турніру
 */
router.put("/tournaments/:id", async (req, res) => {
  try {
    const tour = await Tournament.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user.id },
      req.body,
      { new: true }
    );
    if (!tour) return res.status(404).json({ message: "Tournament not found or forbidden" });
    res.json(tour);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating tournament" });
  }
});

/**
 * PUT /api/organizer/tournaments/:id/add-team
 * Додати команду до турніру
 * body: { teamId }
 */
router.put("/tournaments/:id/add-team", async (req, res) => {
  try {
    const { teamId } = req.body;
    const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
    if (!tour) return res.status(404).json({ message: "Tournament not found" });

    if (!tour.teams.includes(teamId)) {
      tour.teams.push(teamId);
      await tour.save();
    }

    res.json(tour);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding team" });
  }
});

/**
 * POST /api/organizer/tournaments/:id/generate
 * Згенерувати матчі: груповий етап та/або плейофф
 */
router.post("/tournaments/:id/generate", async (req, res) => {
  try {
    const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
    if (!tour) return res.status(404).json({ message: "Tournament not found" });

    // прибрати старі матчі
    await Match.deleteMany({ tournament: tour._id });

    const teams = tour.teams.map(t => t.toString());
    const matches = [];

    // Груповий етап
    if (tour.groupStage) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          // одне або два кола
          matches.push({ teamA: teams[i], teamB: teams[j] });
          if (tour.groupLegs === 2) {
            matches.push({ teamA: teams[j], teamB: teams[i] });
          }
        }
      }
    }

    // Плей-офф (всі команди по рейтингу)
    if (tour.playoff) {
      // сортування команд випадково
      const shuffled = teams.sort(() => Math.random() - 0.5);
      for (let k = 0; k < shuffled.length; k += 2) {
        if (shuffled[k + 1]) {
          matches.push({ teamA: shuffled[k], teamB: shuffled[k + 1] });
        }
      }
    }

    // Створюємо записи Match із датою за замовчуванням
    const created = await Promise.all(matches.map(async m => {
      const date = new Date(tour.startDate);
      // просте їх відкладення на дні
      date.setDate(date.getDate() + Math.floor(Math.random() * 5));
      const match = new Match({
        tournament: tour._id,
        teamA: m.teamA,
        teamB: m.teamB,
        date,
        status: "scheduled",
        score: { teamA: null, teamB: null }
      });
      await match.save();
      return match;
    }));

    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating bracket" });
  }
});

/**
 * GET /api/organizer/tournaments/:id/matches
 * Повернути всі матчі цього турніру
 */
router.get("/tournaments/:id/matches", async (req, res) => {
  try {
    const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
    if (!tour) return res.status(404).json({ message: "Tournament not found" });

    const matches = await Match.find({ tournament: tour._id })
      .populate("teamA", "name")
      .populate("teamB", "name")
      .sort("date");
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching matches" });
  }
});

module.exports = router;
