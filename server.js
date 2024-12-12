const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Manager = require("./models/manager");
const Player = require("./models/player");
const Team = require("./models/team");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Telegram Login
app.get("/auth/telegram", async (req, res) => {
    const { id, first_name, username } = req.query;

    if (!id || !username) {
        return res.status(400).send("Invalid Telegram login request.");
    }

    try {
        let manager = await Manager.findOne({ telegramId: id });

        if (!manager) {
            // Create a new manager
            manager = new Manager({
                telegramId: id,
                username: username,
                firstName: first_name,
                teams: [],
            });
            await manager.save();

            // Create a default team for the manager
            const defaultTeam = new Team({
                managerId: manager._id,
                name: "Default Team",
                nationality: "Global",
            });
            await defaultTeam.save();

            // Assign NPC players to the team
            const npcPlayers = [];
            for (let i = 0; i < 5; i++) {
                const player = new Player({
                    name: `NPC Player ${i + 1}`,
                    nationality: i < 4 ? "Global" : "Other",
                    skill: Math.floor(Math.random() * 100) + 1, // Skill between 1-100
                    teamId: defaultTeam._id,
                });
                npcPlayers.push(player);
            }
            await Player.insertMany(npcPlayers);

            res.redirect(`/team-creation.html?username=${username}`);
        } else {
            res.redirect(`/dashboard.html?username=${username}`);
        }
    } catch (err) {
        console.error("Error during Telegram login:", err);
        res.status(500).send("An error occurred during Telegram login.");
    }
});

// Get Team Data
app.get("/api/team/:managerId", async (req, res) => {
    const { managerId } = req.params;

    try {
        const team = await Team.findOne({ managerId }).populate("players");
        if (!team) return res.status(404).send("Team not found.");

        res.json(team);
    } catch (err) {
        console.error("Error fetching team data:", err);
        res.status(500).send("Failed to fetch team data.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
