const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Player name
    nationality: { type: String, required: true }, // Player's nationality
    role: { type: String, enum: ['AWPer', 'Rifler', 'Support', 'IGL'], required: true }, // Player role
    skill: {
        accuracy: { type: Number, default: 50 }, // Skill: Accuracy (0-100)
        strategy: { type: Number, default: 50 }, // Skill: Strategy (0-100)
        reaction: { type: Number, default: 50 }, // Skill: Reaction (0-100)
    },
    value: { type: Number, default: 1000 }, // Player market value
    age: { type: Number, default: 20 }, // Player age
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // Link to the team
});

module.exports = mongoose.model('Player', PlayerSchema);
