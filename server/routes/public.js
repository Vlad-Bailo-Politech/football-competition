const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Team = require('../models/Team');
const User = require('../models/User');

// Отримати всі турніри
router.get('/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('organizer', 'name');
    res.json(tournaments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати матчі дня
router.get('/matches-of-the-day', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const matches = await Match.find({ date: { $gte: today, $lt: tomorrow } })
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('tournament', 'name');

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/public/stats
router.get('/stats', async (req, res) => {
  try {
    const tournamentCount = await Tournament.countDocuments();
    const teamCount = await Team.countDocuments();
    const matchCount = await Match.countDocuments({
      date: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lte: new Date()
      }
    });
    const viewCount = 24000;

    res.json({ tournamentCount, teamCount, matchCount, viewCount });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Отримати всі матчі
router.get('/all-matches', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('tournament', 'name');

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Отримати всі команди
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find().populate('tournament', 'name');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

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

module.exports = router;
