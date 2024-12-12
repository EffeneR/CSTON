const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Team name
    nationality: { type: String, required: true }, // Team's chosen nationality
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager', required: true }, // Link to the human manager
    roster: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // Array of NPC player IDs
    wins: { type: Number, default: 0 }, // Matches won
    losses: { type: Number, default: 0 }, // Matches lost
    rank: { type: String, default: 'Rookie' }, // Team rank
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Team', TeamSchema);
