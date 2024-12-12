app.post('/api/auth/telegram', async (req, res) => {
    try {
        const { hash, ...data } = req.body;

        // Validate Payload
        const secret = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const checkString = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('\n');
        const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
        if (hash !== hmac) {
            return res.status(403).json({ message: 'Invalid authentication' });
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
        res.json({ token, username: player.username });
    } catch (error) {
        console.error('Telegram authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add GET handler for Telegram login
app.get('/api/auth/telegram', async (req, res) => {
    try {
        const { hash, ...data } = req.query;

        // Validate Payload
        const secret = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
        const checkString = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('\n');
        const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
        if (hash !== hmac) {
            return res.status(403).json({ message: 'Invalid authentication' });
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
        const redirectUrl = `/dashboard?token=${token}&username=${data.username}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Telegram authentication error:', error);
        res.status(500).send('Internal server error');
    }
});
