const API_BASE_URL = 'https://cston.onrender.com/api';

function clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    initializeApp();
}

async function fetchTeamStatus() {
    const token = localStorage.getItem('token');
    if (!token) return { hasTeam: false };

    const response = await fetch(`${API_BASE_URL}/player/team`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
}

async function loadTeamStatus() {
    const teamStatus = await fetchTeamStatus();
    const teamInfoDiv = document.getElementById('team-info');
    const createTeamBtn = document.getElementById('create-team-btn');

    if (teamStatus.hasTeam) {
        createTeamBtn.style.display = 'none';
        teamInfoDiv.innerHTML = `
            <h3>${teamStatus.team.name}</h3>
            <p>Nationality: ${teamStatus.team.nationality}</p>
            <ul>${teamStatus.team.players.map(player => `
                <li>${player.name} (${player.position}) - Skill: ${player.skillLevel}</li>`).join('')}</ul>`;
    } else {
        createTeamBtn.style.display = 'block';
        teamInfoDiv.innerHTML = '<p>You do not have a team yet.</p>';
    }
}

function initializeApp() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        document.getElementById('telegram-login-container').style.display = 'none';
        document.getElementById('logged-in-as').style.display = 'block';
        document.getElementById('username').textContent = username;

        loadTeamStatus();
    } else {
        document.getElementById('telegram-login-container').style.display = 'block';
        document.getElementById('logged-in-as').style.display = 'none';
    }
}

initializeApp();
