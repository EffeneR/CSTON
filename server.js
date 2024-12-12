const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const Manager = require("./models/manager");
const Player = require("./models/player");
const Team = require("./models/team");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Telegram Login Route
app.get("/auth/telegram", (req, res) => {
  // Check if Telegram login request has query parameters
  const { id, username } = req.query;
  if (!id || !username) {
    return res.status(400).send("Invalid Telegram login request.");
  }

  // Check if the manager exists in the database
  Manager.findOne({ telegramId: id })
    .then((manager) => {
      if (manager) {
        // Manager exists, log them in
        res.redirect(`/dashboard.html?username=${username}`);
      } else {
        // Create a new manager entry
        const newManager = new Manager({
          telegramId: id,
          username: username,
          teams: [],
        });
        return newManager.save();
      }
    })
    .then(() => {
      res.redirect(`/dashboard.html?username=${username}`);
    })
    .catch((err) => {
      console.error("Error during Telegram login:", err);
      res.status(500).send("An error occurred during Telegram login.");
    });
});

// API Routes
app.get("/api/managers", async (req, res) => {
  try {
    const managers = await Manager.find();
    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/players", async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/teams", async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
