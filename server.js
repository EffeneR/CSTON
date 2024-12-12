require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Models
const playerSchema = new mongoose.Schema({
    telegramId: { type: String, unique: true },
    username: String,
    avatar: String,
    matchesPlayed: { type: Number, default: 0 },
    rank: { type: String, default: 'Rookie' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    lastLogin: { type: Date, default: Date.now },
});
const Player = mongoose.model('Player', playerSchema);

const teamSchema = new mongoose.Schema({
    name: String,
    nationality: String,
    players: [
        {
            name: String,
            position: String,
            skillLevel: { type: Number, default: 20 },
        },
    ],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
});
const Team = mongoose.model('Team', teamSchema);

// Routes
app.get('/api/players', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/players', async (req, res) => {
    try {
        const { telegramId, username, avatar } = req.body;

        if (!telegramId || !username) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let player = await Player.findOne({ telegramId });
        if (!player) {
            player = new Player({ telegramId, username, avatar });
            await player.save();
        }
        res.json(player);
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
