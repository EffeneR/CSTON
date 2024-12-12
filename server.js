const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Database connection error:', err));

// Models
const Manager = require('./models/manager'); // For managing team owners (Telegram users)
const Player = require('./models/player');   // For NPC players
const Team = require('./models/team');       // For team management

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manager registration route
app.post('/api/manager/register', async (req, res) => {
    const { telegramId, username, teamName, nationality } = req.body;

    try {
        // Check if manager already exists
        let manager = await Manager.findOne({ telegramId });

        if (!manager) {
            // Create new manager
            manager = new Manager({ telegramId, username, teamName, nationality });
            await manager.save();

            // Automatically generate NPC players
            const players = [];
            for (let i = 0; i < 5; i++) {
                players.push(new Player({
                    name: `Player${i + 1}`,
                    skill: Math.floor(Math.random() * 100),
                    nationality: i < 4 ? nationality : 'International', // At least 4 players from the team nationality
                    teamId: manager._id,
                }));
            }
            await Player.insertMany(players);

            res.status(201).json({ message: 'Manager and team created successfully', manager });
        } else {
            res.status(400).json({ message: 'Manager already exists' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error registering manager', error });
    }
});

// Fetch manager details
app.get('/api/manager/:id', async (req, res) => {
    try {
        const manager = await Manager.findById(req.params.id).populate('players');
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' });
        }
        res.json(manager);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching manager details', error });
    }
});

// Fetch players
app.get('/api/players', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players', error });
    }
});

// Telegram authentication route
app.get('/auth/telegram', (req, res) => {
    res.send('Telegram login functionality coming soon.');
});

// Catch-all route for undefined endpoints
app.use((req, res) => {
    res.status(404).send('Endpoint not found');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
