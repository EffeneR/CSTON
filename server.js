const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const Manager = require('./models/manager'); // Adjust the path based on your structure
const app = express();

app.use(express.json());
app.use(express.static('public'));

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
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

    let manager = await Manager.findOne({ telegramId: id });
    if (!manager) {
        manager = new Manager({
            telegramId: id,
            username: username || `guest_${id}`,
            firstName: first_name || 'Guest',
            avatar: photo_url || '',
            teamId: null,
        });
        await manager.save();
    }

    res.redirect(`/dashboard?username=${manager.username}`);
});

app.get('/dashboard', (req, res) => {
    res.send(`<h1>Welcome, ${req.query.username}</h1><p>Your team is ready to compete!</p>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
