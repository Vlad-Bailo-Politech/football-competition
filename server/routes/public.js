const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Team = require('../models/Team');
const User = require('../models/User');

// // Отримати всі турніри
// router.get('/tournaments', async (req, res) => {
//   try {
//     const tournaments = await Tournament.find().populate('organizer', 'name');
//     res.json(tournaments);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Отримати матчі дня
router.get('/matches-of-the-day', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const matches = await Match.find({ date: { $gte: today, $lt: tomorrow } })
      .populate('homeTeam', 'name')      // підтягуємо назву домашньої команди
      .populate('awayTeam', 'name')      // підтягуємо назву гостьової команди
      .populate('tournament', 'name');  // підтягуємо назву турніру

    // Трансформація даних для фронтенду
    const response = matches.map(match => ({
      _id: match._id,
      teamA: { _id: match.homeTeam._id, name: match.homeTeam.name },
      teamB: { _id: match.awayTeam._id, name: match.awayTeam.name },
      date: match.date,
      location: match.location,
      status: match.status === 'upcoming' ? 'scheduled' : match.status, // щоб збігалося з фронтом
      score: { teamA: match.score.home, teamB: match.score.away },
      tournamentName: match.tournament?.name || 'Турнір'
    }));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/public/stats
router.get('/stats', async (req, res) => {
  try {
    // Підрахунок кількості турнірів
    const tournamentCount = await Tournament.countDocuments();

    // Підрахунок кількості команд
    const teamCount = await Team.countDocuments();

    // Підрахунок кількості матчів у поточному місяці
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const matchCount = await Match.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Можна замінити на реальну лічильність переглядів трансляцій, зараз фіктивне значення
    const viewCount = 24000;

    res.json({ tournamentCount, teamCount, matchCount, viewCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка при отриманні статистики' });
  }
});

// // Отримати всі матчі
// router.get('/all-matches', async (req, res) => {
//   try {
//     const matches = await Match.find()
//       .populate('teamA', 'name')
//       .populate('teamB', 'name')
//       .populate('tournament', 'name');

//     res.json(matches);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Отримати всі команди
// router.get('/teams', async (req, res) => {
//   try {
//     const teams = await Team.find().populate('tournament', 'name');
//     res.json(teams);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Отримати всіх гравців
router.get('/players', async (req, res) => {
  try {
    const players = await User.find({ role: 'player' })
      .select('-password')
      .populate('team', 'name');
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати всіх тренерів
router.get('/coaches', async (req, res) => {
  try {
    const coaches = await User.find({ role: 'coach' })
      .select('-password')
      .populate('team', 'name');
    res.json(coaches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати всіх рефері
router.get('/referees', async (req, res) => {
  try {
    const referees = await User.find({ role: 'referee' })
      .select('-password')
      .populate('team', 'name');
    res.json(referees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/public/tournaments
 * Отримати список усіх турнірів
 */
router.get("/tournaments", async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("teams", "name logo")
      .populate("matches", "date location status");
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: "Помилка при завантаженні турнірів" });
  }
});

// Генерація турнірної таблиці
function generateStandings(tournament) {
  const table = tournament.teams.map(team => ({
    team,
    position: 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0
  }));

  tournament.matches.forEach(match => {
    if (match.status !== 'finished') return;
    const home = table.find(t => t.team._id.equals(match.homeTeam._id));
    const away = table.find(t => t.team._id.equals(match.awayTeam._id));

    home.played++;
    away.played++;

    if (match.score.home > match.score.away) {
      home.wins++; home.points += 3;
      away.losses++;
    } else if (match.score.home < match.score.away) {
      away.wins++; away.points += 3;
      home.losses++;
    } else {
      home.draws++; home.points += 1;
      away.draws++; away.points += 1;
    }
  });

  table.sort((a, b) => b.points - a.points);
  table.forEach((row, i) => row.position = i + 1);

  return table;
}

// GET /api/public/tournaments/:id
router.get('/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate({
        path: 'teams',
        populate: { path: 'players', model: 'User' } // підтягуємо гравців у команді
      })
      .populate({
        path: 'matches',
        populate: ['homeTeam', 'awayTeam'] // підтягуємо об'єкти команд у матчах
      })
      .lean();

    if (!tournament) {
      return res.status(404).json({ message: 'Турнір не знайдено' });
    }

    // Формуємо масив гравців з командами
    tournament.players = tournament.teams.flatMap(team =>
      team.players.map(player => ({
        ...player,
        team: {
          _id: team._id,
          name: team.name
        }
      }))
    );

    // Генеруємо standings
    tournament.standings = generateStandings(tournament);

    res.json(tournament);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

/**
 * GET /api/public/matches
 * Отримати всі матчі
 */
router.get("/matches", async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("homeTeam", "name logo")
      .populate("awayTeam", "name logo")
      .populate("tournament", "name logo");
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: "Помилка при завантаженні матчів" });
  }
});

/**
 * GET /api/public/matches/:id
 * Отримати деталі конкретного матчу
 */
router.get("/matches/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("homeTeam", "name logo")
      .populate("awayTeam", "name logo")
      .populate("tournament", "name logo");

    if (!match) {
      return res.status(404).json({ message: "Матч не знайдено" });
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: "Помилка при завантаженні матчу" });
  }
});

/**
 * GET /api/public/teams
 * Отримати список усіх команд
 */
router.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Помилка при завантаженні команд" });
  }
});

/**
 * GET /api/public/teams/:id
 * Отримати деталі конкретної команди
 */
router.get("/teams/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate("players", "name number position");

    if (!team) {
      return res.status(404).json({ message: "Команда не знайдена" });
    }

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Помилка при завантаженні команди" });
  }
});

module.exports = router;
