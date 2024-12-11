const API_BASE_URL = 'https://cston.onrender.com/api'; // Adjust this to your deployed backend URL

// Fetch leaderboard data from the server
async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
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

    container.innerHTML = leaderboard.map((player, index) => `
        <li>
            <span>${index + 1}. ${player.username}</span>
            <span>Wins: ${player.matchesWon}</span>
            <span>Played: ${player.matchesPlayed}</span>
            <span>Rank: ${player.rank}</span>
        </li>
    `).join('');
}

// Populate match info section
async function populateMatches() {
    const matches = await fetchMatches();

    const activeContainer = document.querySelector('#active-matches');
    const completedContainer = document.querySelector('#completed-matches');

    // Separate active and completed matches
    const activeMatches = matches.filter(match => match.status === 'pending');
    const completedMatches = matches.filter(match => match.status === 'completed');

    // Populate Active Matches
    activeContainer.innerHTML = activeMatches.map(match => `
        <li>
            <span>Players: ${match.players.join(', ')}</span>
            <span>Prize Pool: ${match.prizePool}</span>
            <span>Status: ${match.status}</span>
        </li>
    `).join('');

    // Populate Completed Matches
    completedContainer.innerHTML = completedMatches.map(match => `
        <li>
            <span>Winner: ${match.winner}</span>
            <span>Scores: ${JSON.stringify(match.scores)}</span>
            <span>Duration: ${match.duration} seconds</span>
        </li>
    `).join('');
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
