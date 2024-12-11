const API_BASE_URL = 'https://cston.onrender.com/api'; // Adjust this to your deployed backend URL

// Fetch leaderboard data from the server
async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

// Fetch matches data from the server
async function fetchMatches() {
    try {
        const response = await fetch(`${API_BASE_URL}/matches`);
        if (!response.ok) {
            throw new Error('Failed to fetch matches');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching matches:', error);
        return [];
    }
}

// Populate leaderboard section
async function populateLeaderboard() {
    const leaderboard = await fetchLeaderboard();
    const container = document.querySelector('#leaderboard-container');

    if (!leaderboard.length) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }

    container.innerHTML = leaderboard.map((player, index) => `
        <li>
            <span>${index + 1}. ${player.username}</span>
            <span>Wins: ${player.matchesWon || 0}</span>
            <span>Played: ${player.matchesPlayed || 0}</span>
            <span>Rank: ${player.rank || 'N/A'}</span>
        </li>
    `).join('');
}

// Populate match info section
async function populateMatches() {
    const matches = await fetchMatches();

    const activeContainer = document.querySelector('#active-matches');
    const completedContainer = document.querySelector('#completed-matches');

    if (!matches.length) {
        activeContainer.innerHTML = '<p>No active matches</p>';
        completedContainer.innerHTML = '<p>No completed matches</p>';
        return;
    }

    // Separate active and completed matches
    const activeMatches = matches.filter(match => match.status === 'pending');
    const completedMatches = matches.filter(match => match.status === 'completed');

    // Populate Active Matches
    activeContainer.innerHTML = activeMatches.map(match => `
        <li>
            <span>Players: ${match.players.join(', ')}</span>
            <span>Status: ${match.status}</span>
        </li>
    `).join('') || '<p>No active matches</p>';

    // Populate Completed Matches
    completedContainer.innerHTML = completedMatches.map(match => `
        <li>
            <span>Winner: ${match.winner || 'N/A'}</span>
            <span>Scores: ${match.scores ? JSON.stringify(match.scores) : 'N/A'}</span>
            <span>Duration: ${match.duration || 'N/A'} seconds</span>
        </li>
    `).join('') || '<p>No completed matches</p>';
}

// Initialize the app by populating data
function initializeApp() {
    populateLeaderboard();
    populateMatches();

    // Optionally, refresh data every 30 seconds
    setInterval(() => {
        populateLeaderboard();
        populateMatches();
    }, 30000); // Refresh every 30 seconds
}

initializeApp();
