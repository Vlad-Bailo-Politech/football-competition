const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  logoUrl:  String,
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  coach:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);