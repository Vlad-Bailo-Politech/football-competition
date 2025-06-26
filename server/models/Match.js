const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  date: { type: Date, required: true },
  location: String,
  score: {
    teamA: { type: Number, default: 0 },
    teamB: { type: Number, default: 0 }
  },
  status: { type: String, enum: ["scheduled", "finished"], default: "scheduled" }
}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);