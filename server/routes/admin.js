const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');

const router = express.Router();

// Всі ці маршрути доступні тільки адміну
router.use(auth, requireRole('admin'));

/**
 * POST /api/admin/users
 * Створює нового користувача з роллю organizer | coach | player | referee
 */
router.post('/users', upload.single('photo'), async (req, res) => {
  const { name, email, password, role, birthDate, team } = req.body;

  if (!['organizer', 'coach', 'player', 'referee'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashed,
      role,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      birthDate: birthDate || null,
      team: team || null // 👈 якщо не передати, то user без команди
    });

    await newUser.save();

    // Якщо юзеру передали команду → додаємо його у Team
    if (team) {
      const foundTeam = await Team.findById(team);
      if (foundTeam) {
        if (role === 'player') {
          foundTeam.players.push(newUser._id);
        } else if (role === 'coach' && !foundTeam.coach) {
          foundTeam.coach = newUser._id;
        }
        await foundTeam.save();
      }
    }

    await newUser.populate('team');

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      photo: newUser.photo,
      birthDate: newUser.birthDate,
      team: newUser.team
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/admin/users/:id/team
 * Переводить гравця/тренера в іншу команду або прибирає з команди
 * body: { teamId: "..." | null }
 */
router.put('/users/:id/team', async (req, res) => {
  const { teamId } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Якщо у користувача вже була команда — прибираємо його звідти
    if (user.team) {
      const oldTeam = await Team.findById(user.team);
      if (oldTeam) {
        if (user.role === 'player') {
          oldTeam.players = oldTeam.players.filter(
            (p) => p.toString() !== user._id.toString()
          );
        } else if (user.role === 'coach' && oldTeam.coach?.toString() === user._id.toString()) {
          oldTeam.coach = null;
        }
        await oldTeam.save();
      }
    }

    // 2. Якщо передали нову команду → додаємо користувача туди
    if (teamId) {
      const newTeam = await Team.findById(teamId);
      if (!newTeam) {
        return res.status(404).json({ message: 'New team not found' });
      }

      if (user.role === 'player') {
        if (!newTeam.players.includes(user._id)) {
          newTeam.players.push(user._id);
        }
      } else if (user.role === 'coach') {
        if (newTeam.coach && newTeam.coach.toString() !== user._id.toString()) {
          return res.status(400).json({ message: 'This team already has a coach' });
        }
        newTeam.coach = user._id;
      }

      await newTeam.save();
      user.team = newTeam._id;
    } else {
      // Якщо teamId = null → залишаємо без команди
      user.team = null;
    }

    await user.save();
    await user.populate('team');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/users
 * Повертає список усіх користувачів (окрім адміну)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .populate('team'); // ⚽ підтягування команди
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/admin/users/:id
 * Оновлює name, email, role та за бажанням password
 */
router.put('/users/:id', async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!['organizer', 'coach', 'player', 'referee'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    user.email = email;
    user.role = role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const out = user.toObject();
    delete out.password;
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Видаляє користувача
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==== Teams CRUD ====

// GET /api/admin/teams → всі команди
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('coach', 'name role photo')
      .populate('players', 'name role photo');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/teams → створити нову команду
router.post('/teams', async (req, res) => {
  try {
    const { name, coach, players } = req.body;
    const team = new Team({ name, coach, players });
    await team.save();
    await team.populate('coach players');
    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/teams/:id → оновити команду
router.put('/teams/:id', async (req, res) => {
  try {
    const updated = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('coach players');
    if (!updated) return res.status(404).json({ message: 'Team not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/teams/:id → видалити команду
router.delete('/teams/:id', async (req, res) => {
  try {
    const deleted = await Team.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
