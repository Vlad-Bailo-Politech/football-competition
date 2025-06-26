const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  startDate: Date,
  endDate: Date,
  format: { type: String, enum: ["group", "playoff", "mixed"], default: "group" },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);