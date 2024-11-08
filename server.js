require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api'); // Add Telegram Bot API

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

// Handle /start command from Telegram
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the CSTON Miniapp! Use the available options to continue.');
});

// Handle other messages or commands
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text !== '/start') {
        bot.sendMessage(chatId, 'I am here to assist you with CSTON Miniapp. Type /start to begin.');
    }
});

// Player Schema and Model
const playerSchema = new mongoose.Schema({
    telegramId: String,
    username: String,
    avatar: String,
    matchesPlayed: { type: Number, default: 0 },
    rank: { type: String, default: "Rookie" }
});

const Player = mongoose.model('Player', playerSchema);

// Verify Telegram User & Issue JWT
app.post('/api/auth/telegram', async (req, res) => {
    try {
        const { hash, ...data } = req.body;

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

// Serve Static Files
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
