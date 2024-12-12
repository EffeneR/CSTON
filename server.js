const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const Player = require('./models/player');
const Manager = require('./models/manager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the CSTON Mini App</h1><p>Use API routes to interact with the app.</p>');
});

// Routes for Managers
app.post('/api/managers/register', async (req, res) => {
  const { telegramId, username, teamName, teamNationality } = req.body;

  try {
    // Check if manager exists
    let manager = await Manager.findOne({ telegramId });
    if (manager) {
      return res.status(400).json({ error: 'Manager already exists' });
    }

    // Create manager
    manager = new Manager({
      telegramId,
      username,
      teamName,
      teamNationality,
    });

    await manager.save();

    // Automatically assign players
    const players = [];
    for (let i = 0; i < 5; i++) {
      const isSameNationality = i < 4; // First 4 players match team nationality
      const nationality = isSameNationality ? teamNationality : 'Random';

      const player = new Player({
        managerId: manager._id,
        name: generateRandomName(),
        nationality,
        skill: generateRandomSkill(),
      });

      await player.save();
      players.push(player);
    }

    res.json({ manager, players });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register manager' });
  }
});

// Route to Get All Managers
app.get('/api/managers', async (req, res) => {
  try {
    const managers = await Manager.find();
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch managers' });
  }
});

// Routes for Players
app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Utilities for NPC Player Generation
function generateRandomName() {
  const firstNames = ['Alex', 'Chris', 'Taylor', 'Jordan', 'Morgan'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Williams', 'Jones'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function generateRandomSkill() {
  return Math.floor(Math.random() * 101); // Skill between 0 and 100
}

// 404 Error for Undefined Routes
app.use((req, res) => {
  res.status(404).send('Route not found');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
