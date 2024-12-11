require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Player Schema and Model
const playerSchema = new mongoose.Schema({
    telegramId: String,
    username: String,
    avatar: String,
    matchesPlayed: { type: Number, default: 0 },
    rank: { type: String, default: "Rookie" },
    lastLogin: { type: Date, default: Date.now }
});

const Player = mongoose.model('Player', playerSchema);

// Match Schema and Model
const matchSchema = new mongoose.Schema({
    players: [String], // Telegram usernames
    winner: { type: String, default: null },
    status: { type: String, default: "pending" }, // pending, completed
    createdAt: { type: Date, default: Date.now }
});

const Match = mongoose.model('Match', matchSchema);

// Verify Telegram User & Issue JWT
app.post('/api/auth/telegram', async (req, res) => {
    try {
        const { hash, ...data } = req.body;

        // Validate payload
        const secret = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const checkString = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('\n');
        const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
        if (hash !== hmac) {
            return res.status(403).json({ message: 'Invalid authentication' });
        }

        let player = await Player.findOne({ telegramId: data.id });
        if (!player) {
            player = new Player({
                telegramId: data.id,
                username: data.username,
                avatar: data.photo_url,
            });
            await player.save();
        }

        const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Telegram authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Player Profile Endpoint
app.get('/api/player', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const player = await Player.findById(decoded.id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        console.error('Player retrieval error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
});

// Create New Match
app.post('/api/matches', async (req, res) => {
    try {
        const { players } = req.body;
        if (players.length < 2) {
            return res.status(400).json({ message: 'At least 2 players are required' });
        }

        const match = new Match({ players });
        await match.save();
        res.json({ message: 'Match created', match });
    } catch (error) {
        console.error('Match creation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// List Matches
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find();
        res.json(matches);
    } catch (error) {
        console.error('Match retrieval error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Telegram Bot Commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the CSTON Miniapp! Use /register to join matches.');
});

bot.onText(/\/register/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;

    if (!username) {
        return bot.sendMessage(chatId, 'You must set a Telegram username to register.');
    }

    let player = await Player.findOne({ username });
    if (!player) {
        return bot.sendMessage(chatId, 'You must log in first using the Miniapp.');
    }

    bot.sendMessage(chatId, 'You are now registered for the next match!');
});

// Serve Static Files
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
