const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Manager = require("./models/manager");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Telegram Login Route
app.get("/auth/telegram", (req, res) => {
    const { id, first_name, username } = req.query;

    if (!id || !username) {
        return res.status(400).send("Invalid Telegram login request.");
    }

    Manager.findOne({ telegramId: id })
        .then((manager) => {
            if (manager) {
                res.redirect(`/dashboard.html?username=${username}`);
            } else {
                const newManager = new Manager({
                    telegramId: id,
                    username: username,
                    firstName: first_name,
                    teams: [],
                });
                return newManager.save().then(() => {
                    res.redirect(`/dashboard.html?username=${username}`);
                });
            }
        })
        .catch((err) => {
            console.error("Error during Telegram login:", err);
            res.status(500).send("An error occurred during Telegram login.");
        });
});

// Base route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
