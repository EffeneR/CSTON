const API_BASE_URL = 'https://cston.onrender.com/api'; // Ensure this matches your Render deployment URL

const TELEGRAM_BOT_USERNAME = 'CSTON_BOT'; // Your Telegram bot's username

function clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    initializeApp();
}

async function fetchTeamStatus() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const response = await fetch(`${API_BASE_URL}/player/team`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching team status:', error);
        return { hasTeam: false };
    }
}

async function createTeam(name, nationality) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/team/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, name, nationality })
        });
        return response.json();
    } catch (error) {
        console.error('Error creating team:', error);
    }
}

async function fetchMatches() {
    try {
        const response = await fetch(`${API_BASE_URL}/matches`);
        return response.json();
    } catch (error) {
        console.error('Error fetching matches:', error);
        return [];
    }
}

function setupUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loggedInAs = document.getElementById('logged-in-as');
    const usernameSpan = document.getElementById('username');
    const createTeamBtn = document.getElementById('create-team-btn');
    const teamInfoDiv = document.getElementById('team-info');

    loginBtn.addEventListener('click', () => {
        const redirectUrl = encodeURIComponent(window.location.origin);
        const tgLoginUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=auth_${redirectUrl}`;
        window.location.href = tgLoginUrl;
    });

    logoutBtn.addEventListener('click', () => {
        clearUserSession();
    });

    createTeamBtn.addEventListener('click', async () => {
        const teamName = prompt('Enter your team name:');
        const teamNationality = prompt('Enter your team nationality:');
        if (teamName && teamNationality) {
            const response = await createTeam(teamName, teamNationality);
            if (response.team) {
                alert('Team created successfully!');
                loadTeamStatus();
            } else {
                alert(response.message || 'Failed to create team');
            }
        }
    });
}

async function loadTeamStatus() {
    const teamStatus = await fetchTeamStatus();
    const createTeamBtn = document.getElementById('create-team-btn');
    const teamInfoDiv = document.getElementById('team-info');

    if (teamStatus.hasTeam) {
        createTeamBtn.style.display = 'none';
        teamInfoDiv.innerHTML = `
            <h3>${teamStatus.team.name}</h3>
            <p>Nationality: ${teamStatus.team.nationality}</p>
            <ul>
                ${teamStatus.team.players.map(player => `
                    <li>${player.name} (${player.position}) - Skill: ${player.skillLevel}</li>
                `).join('')}
            </ul>
        `;
    } else {
        createTeamBtn.style.display = 'block';
        teamInfoDiv.innerHTML = '<p>You do not have a team yet.</p>';
    }
}

async function loadMatches() {
    const matches = await fetchMatches();
    const activeMatchesContainer = document.getElementById('active-matches');
    const completedMatchesContainer = document.getElementById('completed-matches');

    const activeMatches = matches.filter(match => match.status === 'pending');
    const completedMatches = matches.filter(match => match.status === 'completed');

    activeMatchesContainer.innerHTML = activeMatches.map(match => `
        <li>Players: ${match.players.join(', ')}</li>
    `).join('');

    completedMatchesContainer.innerHTML = completedMatches.map(match => `
        <li>Winner: ${match.winner}</li>
    `).join('');
}

async function initializeApp() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const loginBtn = document.getElementById('login-btn');
    const loggedInAs = document.getElementById('logged-in-as');
    const usernameSpan = document.getElementById('username');

    if (token && username) {
        loginBtn.style.display = 'none';
        loggedInAs.style.display = 'block';
        usernameSpan.textContent = username;

        await loadTeamStatus();
        await loadMatches();
    } else {
        loginBtn.style.display = 'block';
        loggedInAs.style.display = 'none';
    }
}

initializeApp();
