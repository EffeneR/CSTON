const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const managerRoutes = require('./routes/managers');
const playerRoutes = require('./routes/players');
const teamRoutes = require('./routes/teams');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 10000; // Render assigns a PORT

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ Database connection error:', err.message);
    });

// Static File Serving (if needed for front-end assets)
app.use(express.static(path.join(__dirname, 'public')));

// Health Check Route for Render
app.get('/health', (req, res) => {
    res.status(200).send('Health Check OK');
});

// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the CSTON Mini App API');
});

// API Routes
app.use('/api/managers', managerRoutes); // Routes for managing managers
app.use('/api/players', playerRoutes); // Routes for NPC players
app.use('/api/teams', teamRoutes); // Routes for managing teams

// Catch-All Route for Undefined Routes
app.all('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
