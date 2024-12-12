const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
  name: { type: String, required: true },
  nationality: { type: String, required: true },
  skill: { type: Number, required: true },
});

module.exports = mongoose.model('Player', playerSchema);
