const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: null },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', default: null },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
