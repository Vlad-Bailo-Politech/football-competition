const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  
  date: { type: Date, required: true }, // дата матчу
  location: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['upcoming', 'finished', 'active'], 
    default: 'upcoming' 
  },

  // результат
  score: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 }
  },

}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);