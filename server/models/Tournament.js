const mongoose = require('mongoose');
const Match = require('./Match');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // назва турніру
  description: { type: String, default: '' }, // опис
  logo: { type: String, default: null }, // емодзі / картинка
  location: { type: String, required: true }, // локація
  startDate: { type: Date, required: true }, // початок
  endDate: { type: Date, required: true }, // кінець

  // зв’язки
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }], // учасники
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }], // матчі

}, { timestamps: true });

// Коли видаляється турнір → видалити всі матчі
tournamentSchema.pre('findOneAndDelete', async function(next) {
  const tournament = await this.model.findOne(this.getFilter());
  if (tournament) {
    await Match.deleteMany({ tournament: tournament._id });
  }
  next();
});

module.exports = mongoose.model('Tournament', tournamentSchema);