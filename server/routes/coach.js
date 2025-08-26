const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');

// Отримати всіх гравців
router.get('/players', async (req, res) => {
  try {
    const players = await User.find({ role: 'player' }).select('_id name');
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати команду тренера
router.get('/my-team', async (req, res) => {
  try {
    const team = await Team.findOne({ coach: req.user.id }).populate('players', 'name');
    if (!team) return res.status(404).json({ message: 'Команду не знайдено' });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Додати гравця
router.put('/teams/:id/add-player', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Команду не знайдено' });
    if (team.players.includes(req.body.playerId)) return res.status(400).json({ message: 'Гравець вже в команді' });

    team.players.push(req.body.playerId);
    await team.save();
    res.json({ message: 'Гравця додано' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Видалити гравця
router.put('/teams/:id/remove-player', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Команду не знайдено' });

    team.players = team.players.filter(playerId => playerId.toString() !== req.body.playerId);
    await team.save();
    res.json({ message: 'Гравця видалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати дані про команду з гравцями
router.get('/teams/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players', 'name email');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати доступних гравців (які ще не в команді цього турніру)
router.get('/teams/:id/available-players', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Отримати всі команди цього турніру
    const teamsInTournament = await Team.find({ tournament: team.tournament });

    // Отримати всіх зайнятих гравців
    const assignedPlayers = teamsInTournament.flatMap(t => t.players.map(p => p.toString()));

    // Знайти вільних гравців
    const availablePlayers = await User.find({ role: 'player', _id: { $nin: assignedPlayers } })
      .select('name email');

    res.json(availablePlayers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// // Додати гравця до команди
// router.put('/teams/:id/add-player', async (req, res) => {
//   try {
//     const team = await Team.findById(req.params.id);
//     if (!team) return res.status(404).json({ message: 'Team not found' });

//     const { playerId } = req.body;

//     if (team.players.includes(playerId)) {
//       return res.status(400).json({ message: 'Player already in team' });
//     }

//     team.players.push(playerId);
//     await team.save();

//     res.json({ message: 'Player added successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Видалити гравця з команди
// router.put('/teams/:id/remove-player', async (req, res) => {
//   try {
//     const team = await Team.findById(req.params.id);
//     if (!team) return res.status(404).json({ message: 'Team not found' });

//     const { playerId } = req.body;

//     team.players = team.players.filter(p => p.toString() !== playerId);
//     await team.save();

//     res.json({ message: 'Player removed successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;
