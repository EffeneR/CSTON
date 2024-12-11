require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Player Schema
const playerSchema = new mongoose.Schema({
    telegramId: String,
    username: String,
    avatar: String,
    matchesPlayed: { type: Number, default: 0 },
    rank: { type: String, default: "Rookie" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    lastLogin: { type: Date, default: Date.now }
});
const Player = mongoose.model('Player', playerSchema);

// Team Schema
const teamSchema = new mongoose.Schema({
    name: String,
    nationality: String,
    players: [
        {
            name: String,
            position: String,
            skillLevel: { type: Number, default: 20 }
        }
    ],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
});
const Team = mongoose.model('Team', teamSchema);

// Handle Telegram Authentication (GET request)
app.get('/api/auth/telegram', async (req, res) => {
    try {
        const { hash, ...data } = req.query;

        // Validate Payload
        const secret = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const checkString = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('\n');
        const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
        if (hash !== hmac) {
            return res.status(403).send('Invalid authentication');
        }

        let player = await Player.findOne({ telegramId: data.id });
        if (!player) {
            player = new Player({
                telegramId: data.id,
                username: data.username,
                avatar: data.photo_url
            });
            await player.save();
        }

        const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Redirect back to the app with the token
        res.redirect(`/dashboard?token=${token}&username=${data.username}`);
    } catch (error) {
        console.error('Telegram authentication error:', error);
        res.status(500).send('Internal server error');
    }
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Serve Frontend for Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
