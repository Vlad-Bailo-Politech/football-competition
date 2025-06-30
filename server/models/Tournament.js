const mongoose = require("mongoose");
const tournamentSchema = new mongoose.Schema({
  name: String,
  gender: String,
  season: String,
  location: String,
  startDate: Date,
  groupStage: Boolean,
  groupLegs: Number,
  playoff: Boolean,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }]
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);
