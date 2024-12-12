const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const Manager = require('./models/manager');
const Player = require('./models/player');
const Team = require('./models/team');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth/telegram', async (req, res) => {
    const { id, first_name, username, photo_url, hash } = req.query;

    if (!id || !hash) {
        return res.status(400).send('Invalid Telegram login request.');
    }

    const secretKey = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
    const dataCheckString = Object.keys(req.query)
        .filter(key => key !== 'hash')
        .sort()
        .map(key => `${key}=${req.query[key]}`)
        .join('\n');
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
        return res.status(400).send('Invalid Telegram login request.');
    }

    // Check if Manager already exists
    let manager = await Manager.findOne({ telegramId: id });
    if (!manager) {
        // Create Manager
        manager = new Manager({
            telegramId: id,
            username: username || `guest_${id}`,
            firstName: first_name || 'Guest',
            avatar: photo_url || '',
            teamId: null,
        });
        await manager.save();

        // Assign team and NPC players
        const team = new Team({
            managerId: manager._id,
            name: `${first_name || username}'s Team`,
            nationality: 'Default',
        });

        const players = [];
        for (let i = 0; i < 5; i++) {
            players.push(
                new Player({
                    teamId: team._id,
                    name: `NPC Player ${i + 1}`,
                    skill: Math.floor(Math.random() * 100),
                    nationality: 'Default',
                })
            );
        }

        await team.save();
        await Player.insertMany(players);

        manager.teamId = team._id;
        await manager.save();
    }

    res.redirect(`/dashboard?username=${manager.username}`);
});

app.get('/dashboard', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).send('Invalid username.');
    }

    const manager = await Manager.findOne({ username });
    if (!manager) {
        return res.status(404).send('Manager not found.');
    }

    const team = await Team.findById(manager.teamId);
    const players = await Player.find({ teamId: team._id });

    res.send(`
        <h1>Welcome, ${manager.firstName}</h1>
        <h2>Your Team: ${team.name}</h2>
        <ul>
            ${players.map(player => `<li>${player.name} (Skill: ${player.skill})</li>`).join('')}
        </ul>
    `);
});

// Error Handling
app.use((req, res) => {
    res.status(404).send('Page not found.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
