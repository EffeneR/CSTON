// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Player Schema
const playerSchema = new mongoose.Schema({
    telegramId: String,
    name: String,
    avatar: String,
    username: String,
    matchesPlayed: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
});
const Player = mongoose.model('Player', playerSchema);

// Telegram Authentication
app.post('/api/auth/telegram', async (req, res) => {
    try {
        const { tgData } = req.body;

        const player = await Player.findOneAndUpdate(
            { telegramId: tgData.id },
            { ...tgData, lastLogin: new Date() },
            { upsert: true, new: true }
        );

        const token = jwt.sign({ telegramId: player.telegramId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error authenticating Telegram user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Game backend running on http://localhost:${PORT}`);
});
