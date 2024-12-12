const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true }, // Unique identifier for Telegram user
    username: { type: String, required: true }, // Telegram username
    createdAt: { type: Date, default: Date.now }, // Registration time
    lastLogin: { type: Date, default: Date.now }, // Last active timestamp
});

module.exports = mongoose.model('Manager', ManagerSchema);
