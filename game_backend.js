// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/toncs', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Player Schema
const playerSchema = new mongoose.Schema({
    telegramId: String,
    name: String,
    avatar: String,
    username: String,
    matchesPlayed: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
});
const Player = mongoose.model('Player', playerSchema);

// Endpoint for Telegram Authentication
app.post('/api/auth/telegram', async (req, res) => {
    try {
        const { tgData } = req.body;

        if (!tgData) {
            return res.status(400).json({ message: 'Telegram data is required' });
        }

        // Parse Telegram data (for simplicity, just simulating parsed data)
        const user = parseTelegramData(tgData);

        // Find player in the database
        let player = await Player.findOne({ telegramId: user.id });
        if (!player) {
            // If not found, create a new player
            player = new Player({
                telegramId: user.id,
                name: user.first_name,
                avatar: user.photo_url,
                username: user.username,
            });
        }

        // Save or update the player
        await player.save();

        // Generate a JWT token for authentication
        const token = jwt.sign(
            { telegramId: player.telegramId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ player, token });
    } catch (error) {
        console.error('Error during Telegram Authentication:', error);
        res.status(500).json({ message: 'Failed to authenticate user' });
    }
});

// Utility function to parse Telegram init data
function parseTelegramData(initData) {
    // For demonstration purposes, simulating a parsed object
    return {
        id: '123456789',
        first_name: 'User',
        username: 'username_here',
        photo_url: 'https://example.com/photo.jpg',
    };
}

// Define a sample route for getting player details (using JWT token)
app.get('/api/player', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const player = await Player.findOne({ telegramId: decoded.telegramId });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        res.status(200).json(player);
    } catch (error) {
        console.error('Error fetching player data:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
