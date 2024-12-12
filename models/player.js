const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    skill: { type: Number, required: true },
    nationality: { type: String, required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
});

module.exports = mongoose.model('Player', playerSchema);
