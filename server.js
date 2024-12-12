const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Manager = require('./models/manager');
const Player = require('./models/player');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/register', async (req, res) => {
    const { telegramId, username, teamName, nationality } = req.body;

    try {
        let manager = await Manager.findOne({ telegramId });

        if (!manager) {
            manager = new Manager({
                telegramId,
                username,
                teamName,
                nationality,
            });
            await manager.save();

            // Create NPC players
            const players = [];
            const npcNames = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5']; // Add logic for dynamic names
            const npcNationality = nationality || 'International';

            for (let i = 0; i < 5; i++) {
                const player = new Player({
                    name: npcNames[i],
                    skill: Math.floor(Math.random() * 100) + 1,
                    nationality: i < 4 ? npcNationality : 'International', // 4 players with team nationality
                    teamId: manager._id,
                });
                players.push(player);
            }

            await Player.insertMany(players);
        }

        res.status(200).json({ message: 'Manager and players created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/players', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/managers', async (req, res) => {
    try {
        const managers = await Manager.find();
        res.json(managers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
