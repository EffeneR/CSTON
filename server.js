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

// Initialize Telegram Bot with webhook
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const webhookURL = `${process.env.SERVER_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`;
bot.setWebHook(webhookURL);

// Unified Player Schema
const playerSchema = new mongoose.Schema({
    telegramId: String,
    username: String,
    avatar: String,
    matchesPlayed: { type: Number, default: 0 },
    rank: { type: String, default: "Rookie" },
    lastLogin: { type: Date, default: Date.now }
});
const Player = mongoose.model('Player', playerSchema);

// Match Schema
const matchSchema = new mongoose.Schema({
    players: [String],
    winner: { type: String, default: null },
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now }
});
const Match = mongoose.model('Match', matchSchema);

// Telegram Authentication Endpoint
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

// Create or Join a Match
app.post('/api/matches/join', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        let match = await Match.findOne({ status: 'pending' });
        if (!match) {
            match = new Match({ players: [username], status: 'pending' });
        } else {
            if (match.players.includes(username)) {
                return res.status(400).json({ message: 'You are already in this match' });
            }
            match.players.push(username);
        }

        await match.save();
        res.json({ message: 'Joined match', match });
    } catch (error) {
        console.error('Error joining match:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Webhook for Telegram Bot
app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on ${process.env.SERVER_URL}`);
});
