const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  telegramId: { type: String, required: true, unique: true },
  avatar: { type: String, default: null },
  matchesPlayed: { type: Number, default: 0 },
  rank: { type: String, default: "Rookie" },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  lastLogin: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Player", PlayerSchema);
