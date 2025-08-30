// server/routes/organizer.js
const express = require("express");
const mongoose = require("mongoose"); 
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Match = require("../models/Match");
const User = require("../models/User");
const upload = require('../middleware/upload');

const router = express.Router();

// Всі маршрути під /api/organizer/* доступні лише для організаторів
router.use(auth, requireRole("organizer"));

// ========== TOURNAMENTS ==========

// GET /tournaments
router.get('/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate('teams')
      .populate({
        path: 'matches',
        populate: ['homeTeam', 'awayTeam']
      });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: 'Помилка завантаження турнірів' });
  }
});

// POST /tournaments
router.post('/tournaments', upload.single('logo'), async (req, res) => {
  try {
    const { name, description, location, startDate, endDate, teams } = req.body;

    const tournament = new Tournament({
      name,
      description,
      location,
      startDate,
      endDate,
      teams: Array.isArray(teams) ? teams : [teams],
      logo: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await tournament.save();
    res.status(201).json(tournament);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Не вдалося створити турнір' });
  }
});

// DELETE /api/organizer/tournaments/:id
router.delete('/tournaments/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // шукаємо та видаляємо турнір
        const deletedTournament = await Tournament.findOneAndDelete({ _id: id });

        if (!deletedTournament) {
            return res.status(404).json({ message: 'Турнір не знайдено' });
        }

        // автоматично видаляться всі матчі через pre hook у схемі
        res.json({ message: 'Турнір та всі його матчі видалені успішно' });
    } catch (err) {
        console.error('Помилка видалення турніру:', err);
        res.status(500).json({ message: 'Не вдалося видалити турнір' });
    }
});

// ========== TEAMS ==========

router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Помилка завантаження команд' });
  }
});

// ========== MATCHES ==========

router.post('/matches', async (req, res) => {
  try {
    const { tournament, homeTeam, awayTeam, date, location, status } = req.body;

    const match = new Match({
      tournament,
      homeTeam,
      awayTeam,
      date,
      location,
      status,
      score: { home: 0, away: 0 }
    });

    await match.save();

    await Tournament.findByIdAndUpdate(tournament, {
      $push: { matches: match._id }
    });

    res.status(201).json(match);
  } catch (err) {
    res.status(400).json({ message: 'Не вдалося створити матч' });
  }
});

router.put('/matches/:id', async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
      .populate('homeTeam')
      .populate('awayTeam');

    res.json(match);
  } catch (err) {
    res.status(400).json({ message: 'Не вдалося оновити матч' });
  }
});

// /**
//  * POST /api/organizer/tournaments
//  * Створити новий турнір
//  */
// router.post("/tournaments", async (req, res) => {
//     try {
//         const {
//             name,
//             gender,
//             season,
//             location,
//             startDate,
//             groupStage = false,
//             groupLegs = 1,
//             playoff = false
//         } = req.body;

//         const tour = new Tournament({
//             name,
//             gender,
//             season,
//             location,
//             startDate,
//             groupStage,
//             groupLegs,
//             playoff,
//             organizer: req.user.id,
//             teams: []
//         });

//         await tour.save();
//         res.status(201).json(tour);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error creating tournament" });
//     }
// });

// /**
//  * GET /api/organizer/tournaments
//  * Вивести всі турніри поточного організатора
//  */
// router.get("/tournaments", async (req, res) => {
//     try {
//         const tours = await Tournament.find({ organizer: req.user.id });
//         res.json(tours);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error fetching tournaments" });
//     }
// });

// /**
//  * GET /api/organizer/tournaments/:id
//  * Повернути один турнір (з командами)
//  */
// router.get("/tournaments/:id", async (req, res) => {
//     try {
//         const tour = await Tournament.findOne({
//             _id: req.params.id,
//             organizer: req.user.id
//         }).populate("teams", "name");
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });
//         res.json(tour);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error fetching tournament" });
//     }
// });

// /**
//  * PUT /api/organizer/tournaments/:id
//  * Оновити поля турніру
//  */
// router.put("/tournaments/:id", async (req, res) => {
//     try {
//         const tour = await Tournament.findOneAndUpdate(
//             { _id: req.params.id, organizer: req.user.id },
//             req.body,
//             { new: true }
//         );
//         if (!tour) return res.status(404).json({ message: "Tournament not found or forbidden" });
//         res.json(tour);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error updating tournament" });
//     }
// });

// /**
//  * PUT /api/organizer/tournaments/:id/add-team
//  * Додати команду до турніру
//  * body: { teamId }
//  */
// router.put("/tournaments/:id/add-team", async (req, res) => {
//     try {
//         const { teamId } = req.body;
//         const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });

//         if (!tour.teams.includes(teamId)) {
//             tour.teams.push(teamId);
//             await tour.save();
//         }

//         res.json(tour);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error adding team" });
//     }
// });

// /**
//  * POST /api/organizer/tournaments/:id/generate
//  * Згенерувати матчі: груповий етап та/або плейофф
//  */
// router.post("/tournaments/:id/generate", async (req, res) => {
//     try {
//         const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });

//         await Match.deleteMany({ tournament: tour._id });

//         const teams = tour.teams.map(t => t.toString());
//         const matches = [];

//         if (tour.groupStage) {
//             for (let i = 0; i < teams.length; i++) {
//                 for (let j = i + 1; j < teams.length; j++) {
//                     matches.push({ teamA: teams[i], teamB: teams[j] });
//                     if (tour.groupLegs === 2) {
//                         matches.push({ teamA: teams[j], teamB: teams[i] });
//                     }
//                 }
//             }
//         }

//         if (tour.playoff) {
//             const shuffled = teams.sort(() => Math.random() - 0.5);
//             for (let k = 0; k < shuffled.length; k += 2) {
//                 if (shuffled[k + 1]) {
//                     matches.push({ teamA: shuffled[k], teamB: shuffled[k + 1] });
//                 }
//             }
//         }

//         const created = await Promise.all(matches.map(async m => {
//             const date = new Date(tour.startDate);
//             // Випадкове відкладання на 0-4 днів
//             date.setDate(date.getDate() + Math.floor(Math.random() * 5));
//             // Випадкова година від 17 до 21 (22:00 не включається, бо це верхня межа)
//             const randomHour = 17 + Math.floor(Math.random() * 6);
//             date.setHours(randomHour, 0, 0, 0); // рівна година, хвилини і секунди = 0

//             const match = new Match({
//                 tournament: tour._id,
//                 teamA: m.teamA,
//                 teamB: m.teamB,
//                 date,
//                 status: "scheduled",
//                 score: { teamA: null, teamB: null }
//             });
//             await match.save();
//             return match;
//         }));

//         res.json(created);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error generating bracket" });
//     }
// });

// /**
//  * GET /api/organizer/tournaments/:id/matches
//  * Повернути всі матчі цього турніру
//  */
// router.get("/tournaments/:id/matches", async (req, res) => {
//     try {
//         const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });

//         const matches = await Match.find({ tournament: tour._id })
//             .populate("teamA", "name")
//             .populate("teamB", "name")
//             .sort("date");
//         res.json(matches);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error fetching matches" });
//     }
// });

// /**
//  * POST /api/organizer/teams
//  * Створити нову команду
//  * body: { name, logoUrl, tournament, coach, players }
//  */
// router.post("/teams", async (req, res) => {
//     try {
//         const { name, logoUrl, tournament, coach, players = [] } = req.body;

//         if (!name || !tournament || !coach) {
//             return res.status(400).json({ message: "Name, tournament and coach are required" });
//         }

//         // Перевіряємо чи організатор має доступ до цього турніру
//         const tour = await Tournament.findOne({ _id: tournament, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });

//         // Перевірка: чи вже є команда в цьому турнірі з цим тренером
//         const coachTeam = await Team.findOne({ tournament, coach });
//         if (coachTeam) {
//             return res.status(400).json({ message: "This coach is already assigned to another team in this tournament" });
//         }

//         // Перевірка: чи є хоч один гравець, який вже грає в іншій команді цього турніру
//         const conflictingPlayers = await Team.find({
//             tournament,
//             players: { $in: players }
//         });

//         if (conflictingPlayers.length > 0) {
//             return res.status(400).json({ message: "One or more players are already assigned to another team in this tournament" });
//         }

//         // Створюємо нову команду
//         const team = new Team({
//             name,
//             logoUrl,
//             tournament,
//             coach,
//             players
//         });

//         await team.save();

//         res.status(201).json(team);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error creating team" });
//     }
// });

// /**
//  * GET /api/organizer/tournaments/:id/standings
//  * Повернути турнірну таблицю
//  */
// router.get("/tournaments/:id/standings", async (req, res) => {
//     try {
//         const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });

//         const matches = await Match.find({ tournament: tour._id }).populate("teamA teamB");

//         const table = {};

//         tour.teams.forEach(teamId => {
//             table[teamId.toString()] = {
//                 teamId: teamId.toString(),
//                 teamName: '',
//                 played: 0,
//                 wins: 0,
//                 draws: 0,
//                 losses: 0,
//                 goalsFor: 0,
//                 goalsAgainst: 0,
//                 goalDiff: 0,
//                 points: 0
//             };
//         });

//         const teams = await Team.find({ _id: { $in: tour.teams } });
//         teams.forEach(team => {
//             table[team._id.toString()].teamName = team.name;
//         });

//         matches.forEach(match => {
//             if (match.score.teamA === null || match.score.teamB === null) return;

//             const teamA = table[match.teamA._id.toString()];
//             const teamB = table[match.teamB._id.toString()];

//             teamA.played += 1;
//             teamB.played += 1;

//             teamA.goalsFor += match.score.teamA;
//             teamA.goalsAgainst += match.score.teamB;

//             teamB.goalsFor += match.score.teamB;
//             teamB.goalsAgainst += match.score.teamA;

//             if (match.score.teamA > match.score.teamB) {
//                 teamA.wins += 1;
//                 teamA.points += 3;
//                 teamB.losses += 1;
//             } else if (match.score.teamA < match.score.teamB) {
//                 teamB.wins += 1;
//                 teamB.points += 3;
//                 teamA.losses += 1;
//             } else {
//                 teamA.draws += 1;
//                 teamB.draws += 1;
//                 teamA.points += 1;
//                 teamB.points += 1;
//             }
//         });

//         Object.values(table).forEach(t => {
//             t.goalDiff = t.goalsFor - t.goalsAgainst;
//         });

//         const standings = Object.values(table).sort((a, b) => {
//             if (b.points !== a.points) return b.points - a.points;
//             return b.goalDiff - a.goalDiff;
//         });

//         res.json(standings);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error generating standings" });
//     }
// });

// router.get("/tournaments/:id/available-coaches", async (req, res) => {
//     try {
//         const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });

//         const teams = await Team.find({ tournament: tour._id });

//         // Збір зайнятих тренерів
//         const usedCoachIds = teams
//             .map(team => team.coach ? team.coach.toString() : null)
//             .filter(id => id !== null);

//         const availableCoaches = await User.find({
//             role: 'coach',
//             _id: { $nin: usedCoachIds }
//         }).select('_id name');

//         res.json(availableCoaches);
//     } catch (err) {
//         console.error('Error fetching available coaches:', err.message);
//         res.status(500).json({ message: "Error fetching available coaches" });
//     }
// });

// router.get("/tournaments/:id/available-players", async (req, res) => {
//     try {
//         const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });

//         const teams = await Team.find({ tournament: tour._id });

//         // Збір зайнятих гравців
//         const usedPlayerIds = [];
//         teams.forEach(team => {
//             if (Array.isArray(team.players)) {
//                 team.players.forEach(playerId => {
//                     if (playerId) usedPlayerIds.push(playerId.toString());
//                 });
//             }
//         });

//         const availablePlayers = await User.find({
//             role: 'player',
//             _id: { $nin: usedPlayerIds }
//         }).select('_id name');

//         res.json(availablePlayers);
//     } catch (err) {
//         console.error('Error fetching available players:', err.message);
//         res.status(500).json({ message: "Error fetching available players" });
//     }
// });

// /**
//  * GET /api/organizer/matches/:id
//  * Отримати один матч по id
//  */
// router.get("/matches/:id", async (req, res) => {
//     try {
//         const match = await Match.findById(req.params.id)
//             .populate("teamA", "name")
//             .populate("teamB", "name")
//             .populate("tournament");

//         if (!match) return res.status(404).json({ message: "Match not found" });

//         if (match.tournament.organizer.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Forbidden" });
//         }

//         res.json(match);
//     } catch (err) {
//         console.error('Error fetching match:', err.message);
//         res.status(500).json({ message: "Error fetching match" });
//     }
// });

// /**
//  * DELETE /api/organizer/tournaments/:id
//  */
// router.delete("/tournaments/:id", async (req, res) => {
//     try {
//         const tour = await Tournament.findOneAndDelete({ _id: req.params.id, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found or forbidden" });

//         // Якщо потрібно: видалити також всі матчі та команди цього турніру
//         await Match.deleteMany({ tournament: tour._id });
//         await Team.deleteMany({ _id: { $in: tour.teams } });

//         res.json({ message: "Tournament deleted" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Error deleting tournament" });
//     }
// });

// /**
//  * PUT /api/organizer/matches/:id
//  * Оновити результат матчу
//  * body: { score: { teamA: number, teamB: number }, status: 'scheduled' | 'live' | 'finished' }
//  */
// router.put("/matches/:id", async (req, res) => {
//     try {
//         const match = await Match.findById(req.params.id).populate('tournament');

//         if (!match) return res.status(404).json({ message: "Match not found" });

//         // Перевіряємо, чи цей організатор має доступ до турніру
//         if (match.tournament.organizer.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Forbidden" });
//         }

//         const { score, status } = req.body;

//         match.score = score;
//         match.status = status;

//         await match.save();

//         res.json(match);
//     } catch (err) {
//         console.error('Error updating match:', err.message);
//         res.status(500).json({ message: "Error updating match" });
//     }
// });

// /**
//  * DELETE /api/organizer/teams/:id
//  * Видаляє команду та відв’язує її від турніру
//  */
// router.delete("/teams/:id", async (req, res) => {
//     try {
//         const team = await Team.findById(req.params.id);
//         if (!team) return res.status(404).json({ message: "Team not found" });

//         // Знаходимо турнір, де ця команда додана
//         const tournament = await Tournament.findOne({ teams: team._id });
//         if (!tournament) return res.status(404).json({ message: "Tournament not found" });

//         // Перевіряємо, чи це турнір цього організатора
//         if (tournament.organizer.toString() !== req.user.id) {
//             return res.status(403).json({ message: "Forbidden" });
//         }

//         // Видаляємо команду з БД
//         await Team.findByIdAndDelete(team._id);

//         // Видаляємо посилання з турніру
//         tournament.teams = tournament.teams.filter(t => t.toString() !== team._id.toString());
//         await tournament.save();

//         res.json({ message: "Team successfully deleted and unlinked" });
//     } catch (err) {
//         console.error('Error deleting team:', err);
//         res.status(500).json({ message: "Error deleting team" });
//     }
// });

// /**
//  * PUT /api/organizer/tournaments/:id/remove-team
//  */
// router.put("/tournaments/:id/remove-team", async (req, res) => {
//     try {
//         const { teamId } = req.body;

//         const tour = await Tournament.findOne({ _id: req.params.id, organizer: req.user.id });
//         if (!tour) return res.status(404).json({ message: "Tournament not found" });

//         tour.teams = tour.teams.filter(t => t.toString() !== teamId);

//         await tour.save();

//         res.json(tour);
//     } catch (err) {
//         console.error('Error removing team from tournament:', err);
//         res.status(500).json({ message: "Error removing team" });
//     }
// });

// router.get("/teams/:id", async (req, res) => {
//     try {
//         const team = await Team.findById(req.params.id);
//         if (!team) return res.status(404).json({ message: "Team not found" });

//         res.json(team);
//     } catch (err) {
//         console.error('Error fetching team:', err);
//         res.status(500).json({ message: "Error fetching team" });
//     }
// });

// router.put("/teams/:id", async (req, res) => {
//     try {
//         const { name, coach, players } = req.body;

//         const team = await Team.findById(req.params.id);
//         if (!team) return res.status(404).json({ message: "Team not found" });

//         team.name = name;
//         team.coach = coach;
//         team.players = players;

//         await team.save();

//         res.json(team);
//     } catch (err) {
//         console.error('Error updating team:', err);
//         res.status(500).json({ message: "Error updating team" });
//     }
// });

module.exports = router;
