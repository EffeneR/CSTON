const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

// Models
const Player = require("./models/player");
const Manager = require("./models/manager");
const Team = require("./models/team");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Route: Register a manager and auto-create team and players
app.post("/api/register", async (req, res) => {
    const { telegramId, username, teamName, teamNationality } = req.body;

    try {
        // Check if manager already exists
        let manager = await Manager.findOne({ telegramId });
        if (!manager) {
            manager = new Manager({ telegramId, username });
            await manager.save();
        }

        // Check if team already exists
        let team = await Team.findOne({ managerId: manager._id });
        if (!team) {
            // Create team
            team = new Team({
                managerId: manager._id,
                name: teamName,
                nationality: teamNationality,
            });
            await team.save();

            // Auto-create NPC players
            const players = [];
            for (let i = 0; i < 5; i++) {
                players.push(
                    new Player({
                        teamId: team._id,
                        name: `Player ${i + 1}`,
                        nationality: i < 4 ? teamNationality : "International", // 4 players with team nationality
                        skill: Math.floor(Math.random() * 100), // Random skill 0-99
                    })
                );
            }
            await Player.insertMany(players);
        }

        res.status(200).json({ message: "Registration successful", team, players });
    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route: Get all players for a team
app.get("/api/players/:teamId", async (req, res) => {
    const { teamId } = req.params;

    try {
        const players = await Player.find({ teamId });
        res.status(200).json(players);
    } catch (error) {
        console.error("Error fetching players:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
