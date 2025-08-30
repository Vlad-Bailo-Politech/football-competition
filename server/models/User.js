const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // admin, organizer, coach, player, referee
  photo: { type: String, default: null },
  birthDate: { type: Date, default: null },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }
});

module.exports = mongoose.model('User', userSchema);