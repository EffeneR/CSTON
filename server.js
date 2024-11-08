require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Player Schema and Model
const playerSchema = new mongoose.Schema({
    telegramId: String,
    username: String,
    avatar: String,
    matchesPlayed: { type: Number, default: 0 },
    rank: { type: String, default: "Rookie" }
});

const Player = mongoose.model('Player', playerSchema);

// Telegram Authentication Route
app.post('/api/auth/telegram', async (req, res) => {
    try {
        const { hash, id, username, photo_url } = req.body;

        // Here you should verify the hash using Telegram's API for security purposes.
        // Assuming verification is successful:

        let player = await Player.findOne({ telegramId: id });
        if (!player) {
            player = new Player({
                telegramId: id,
                username: username,
                avatar: photo_url,
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

// Dashboard Endpoint
app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
