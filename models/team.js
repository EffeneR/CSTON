const express = require('express');
const Team = require('../models/team');
const Player = require('../models/player');
const Manager = require('../models/manager');
const router = express.Router();

// Helper: Generate random skills
const generateSkills = () => ({
    accuracy: Math.floor(Math.random() * 50) + 50, // 50-100
    strategy: Math.floor(Math.random() * 50) + 50,
    reaction: Math.floor(Math.random() * 50) + 50,
});

// Helper: Generate players
const generatePlayers = (teamNationality) => {
    const players = [];
    const roles = ['AWPer', 'Rifler', 'Support', 'IGL'];

    // 4 players of the chosen nationality
    for (let i = 0; i < 4; i++) {
        players.push({
            name: `Player${i + 1}`,
            nationality: teamNationality,
            role: roles[i % roles.length],
            skill: generateSkills(),
        });
    }
    // 1 player with random nationality
    players.push({
        name: 'Player5',
        nationality: ['USA', 'Germany', 'Brazil', 'France'][Math.floor(Math.random() * 4)],
        role: 'Support',
        skill: generateSkills(),
    });

    return players;
};

// POST: /team/create
router.post('/create', async (req, res) => {
    const { telegramId, username, teamName, nationality } = req.body;

    try {
        // Create/find manager
        let manager = await Manager.findOne({ telegramId });
        if (!manager) {
            manager = new Manager({ telegramId, username });
            await manager.save();
        }

        // Create team
        const team = new Team({
            name: teamName,
            nationality,
            managerId: manager._id,
        });
        await team.save();

        // Generate players and assign to the team
        const playersData = generatePlayers(nationality);
        const players = await Player.insertMany(
            playersData.map((player) => ({ ...player, teamId: team._id }))
        );

        team.roster = players.map((player) => player._id);
        await team.save();

        res.json({ message: 'Team created successfully!', team, players });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create team.' });
    }
});

module.exports = router;
