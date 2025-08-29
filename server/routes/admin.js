const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');
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
      team: team || null // якщо не передати, то user без команди
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

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role && role !== "all") query.role = role;

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("team")
      .limit(search ? 20 : 0); // ⚡ якщо це автокомпліт – обмежимо

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/admin/users/:id
 * Оновлює name, email, role та за бажанням password
 */
router.put('/users/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password, role, birthDate, team } = req.body;
    const updateData = { name, email, role };

    // Якщо пароль передано — хешуємо
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Якщо дата є — оновлюємо
    if (birthDate) updateData.birthDate = new Date(birthDate);

    // Якщо команда не пуста — оновлюємо, інакше null
    updateData.team = team && team !== '' ? team : null;

    // Якщо прийшов новий файл (фото)
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    // Оновлюємо користувача
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('team');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // --- Додаткова логіка для тренера ---
    if (role === 'coach') {
      // 1. Зняти користувача як тренера з усіх інших команд
      await Team.updateMany(
        { coach: updatedUser._id },
        { $set: { coach: null } }
      );

      // 2. Якщо є вибрана команда — призначити цього користувача тренером
      if (team) {
        await Team.findByIdAndUpdate(team, { coach: updatedUser._id });
      }
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка сервера' });
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
      // .populate('coach', 'name role photo')
      // .populate('players', 'name role photo');
      .populate('coach', 'name')
      .populate('players', 'name')
      .populate('tournament', 'name');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/teams
router.post('/teams', upload.single('logo'), async (req, res) => {
  const { name, coach, tournament, players } = req.body;

  try {
    if (!name || !coach) {
      return res.status(400).json({ message: 'Name and coach are required' });
    }

    // Перевірка тренера
    const coachUser = await User.findById(coach);
    if (!coachUser || coachUser.role !== 'coach') {
      return res.status(400).json({ message: 'Invalid coach' });
    }

    // Якщо він вже був тренером у якійсь команді → знімаємо
    if (coachUser.team) {
      const oldTeam = await Team.findById(coachUser.team);
      if (oldTeam) {
        oldTeam.coach = null;
        await oldTeam.save();
      }
    }

    // Логотип (або дефолтний)
    const logoPath = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Створюємо нову команду
    const newTeam = new Team({
      name,
      logo: logoPath,
      tournament: tournament || null,
      coach: coachUser._id,
      players: players ? (Array.isArray(players) ? players : [players]) : []
    });

    await newTeam.save();

    // Оновлюємо тренера
    coachUser.team = newTeam._id;
    await coachUser.save();

    // Оновлюємо гравців
    if (players) {
      const playerIds = Array.isArray(players) ? players : [players];
      await User.updateMany(
        { _id: { $in: playerIds }, role: 'player' },
        { $set: { team: newTeam._id } }
      );
    }

    await newTeam.populate('coach', 'name role photo');
    await newTeam.populate('players', 'name role photo');

    res.status(201).json(newTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/admin/teams/:id
 * Оновлення даних команди
 */
router.put('/teams/:id', upload.single('logo'), async (req, res) => {
  const { name, coach, tournament, players } = req.body;

  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (name) team.name = name;
    if (req.file) team.logo = `/uploads/${req.file.filename}`;
    if (tournament !== undefined) team.tournament = tournament || null;

    // ---- Оновлюємо тренера ----
    if (coach) {
      const newCoach = await User.findById(coach);
      if (!newCoach || newCoach.role !== 'coach') {
        return res.status(400).json({ message: 'Invalid coach' });
      }

      // якщо він був у іншій команді → знімаємо
      if (newCoach.team && newCoach.team.toString() !== team._id.toString()) {
        const oldTeam = await Team.findById(newCoach.team);
        if (oldTeam) {
          oldTeam.coach = null;
          await oldTeam.save();
        }
      }

      team.coach = newCoach._id;
      newCoach.team = team._id;
      await newCoach.save();
    }

    // ---- Оновлюємо гравців ----
    if (players) {
      const playerIds = Array.isArray(players) ? players : [players];
      team.players = [];

      for (const playerId of playerIds) {
        const player = await User.findById(playerId);
        if (!player || player.role !== 'player') continue;

        // якщо вже був у іншій команді → знімаємо
        if (player.team && player.team.toString() !== team._id.toString()) {
          const oldTeam = await Team.findById(player.team);
          if (oldTeam) {
            oldTeam.players = oldTeam.players.filter(
              (p) => p.toString() !== player._id.toString()
            );
            await oldTeam.save();
          }
        }

        player.team = team._id;
        await player.save();
        team.players.push(player._id);
      }
    }

    await team.save();

    await team.populate('coach', 'name role photo');
    await team.populate('players', 'name role photo');

    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/admin/teams/:id
 * Видалення команди
 */
router.delete('/teams/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Обнуляємо тренера
    if (team.coach) {
      await User.findByIdAndUpdate(team.coach, { $set: { team: null } });
    }

    // Обнуляємо гравців
    if (team.players.length > 0) {
      await User.updateMany(
        { _id: { $in: team.players } },
        { $set: { team: null } }
      );
    }

    await team.deleteOne();

    res.json({ message: 'Team deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// пошук гравців
router.get("/users/search", async (req, res) => {
  try {
    const { role, query } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (query) filter.name = new RegExp(query, "i");

    const users = await User.find(filter).limit(20); // обмежимо 20 результатів
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Помилка пошуку" });
  }
});

// ================= TOURNAMENTS =================

// GET all tournaments
router.get("/tournaments", async (req, res) => {
  try {
    const tournaments = await Tournament.find().select("name season location startDate");
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: "Помилка при отриманні турнірів" });
  }
});

// GET single tournament
router.get("/tournaments/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("teams", "name");
    if (!tournament) return res.status(404).json({ message: "Турнір не знайдено" });
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ message: "Помилка при отриманні турніру" });
  }
});

// CREATE tournament
router.post("/tournaments", async (req, res) => {
  try {
    const newTournament = new Tournament({
      name: req.body.name,
      gender: req.body.gender,
      season: req.body.season,
      location: req.body.location,
      startDate: req.body.startDate,
      groupStage: req.body.groupStage,
      groupLegs: req.body.groupLegs,
      playoff: req.body.playoff,
      organizer: req.user._id,
    });

    await newTournament.save();
    res.status(201).json(newTournament);
  } catch (err) {
    res.status(400).json({ message: "Помилка при створенні турніру", error: err.message });
  }
});

// UPDATE tournament
router.put("/tournaments/:id", async (req, res) => {
  try {
    const updated = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Турнір не знайдено" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Помилка при оновленні турніру", error: err.message });
  }
});

// DELETE tournament
router.delete("/tournaments/:id", async (req, res) => {
  try {
    const deleted = await Tournament.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Турнір не знайдено" });
    res.json({ message: "Турнір видалено" });
  } catch (err) {
    res.status(500).json({ message: "Помилка при видаленні турніру" });
  }
});

module.exports = router;
