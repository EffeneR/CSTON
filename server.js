const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const Manager = require('./models/Manager');
const Player = require('./models/Player');

// Routes
app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to the CSTON Mini App</h1>
        <a href="/auth/telegram">
            <button>Login with Telegram</button>
        </a>
    `);
});

// Telegram Authentication Route
app.get('/auth/telegram', async (req, res) => {
    const { id, hash, first_name, username, photo_url, auth_date } = req.query;

    // Step 1: Validate Telegram data
    const secret = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
    const checkString = Object.keys(req.query)
        .filter((key) => key !== 'hash')
        .sort()
        .map((key) => `${key}=${req.query[key]}`)
        .join('\n');
    const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

    if (hmac !== hash) {
        return res.status(403).send('Unauthorized: Invalid Telegram authentication.');
    }

    // Step 2: Check if the manager already exists
    let manager = await Manager.findOne({ telegramId: id });

    if (!manager) {
        // Step 3: Create a new Manager entry if the user doesn't exist
        manager = new Manager({
            telegramId: id,
            username: username || `User${id}`,
            teamName: `${first_name}'s Team`,
            nationality: 'International', // Default nationality for new users
        });
        await manager.save();

        // Step 4: Create NPC players for the new manager
        const nationalities = ['International', 'Sweden', 'USA', 'Germany'];
        const players = [];
        for (let i = 0; i < 5; i++) {
            players.push(new Player({
                name: `Player${i + 1}`,
                skill: Math.floor(Math.random() * 100),
                nationality: i < 4 ? manager.nationality : nationalities[Math.floor(Math.random() * nationalities.length)],
                teamId: manager._id,
            }));
        }
        await Player.insertMany(players);
    }

    res.send(`Welcome, ${first_name || username}! Your team and players are ready.`);
});

// API Route to Fetch All Players
app.get('/api/players', async (req, res) => {
    const players = await Player.find();
    res.json(players);
});

// API Route to Fetch All Managers
app.get('/api/managers', async (req, res) => {
    const managers = await Manager.find();
    res.json(managers);
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
