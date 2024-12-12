require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
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

// Validate token middleware
const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Bearer token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// API to get team info
app.get('/api/player/team', validateToken, async (req, res) => {
    try {
        const player = await Player.findById(req.user.id).populate('teamId');
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        if (!player.teamId) {
            return res.status(200).json({ hasTeam: false });
        }
        res.status(200).json({ hasTeam: true, team: player.teamId });
    } catch (error) {
        console.error('Error fetching team info:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Redirect from Telegram authentication
app.get('/api/auth/telegram', async (req, res) => {
    try {
        const { hash, ...data } = req.query;
        const secret = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const checkString = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('\n');
        const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

        if (hash !== hmac) {
            return res.status(403).send('Invalid authentication.');
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

        res.redirect(`/team-creation.html?token=${token}`);
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(500).send('Internal server error.');
    }
});

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
