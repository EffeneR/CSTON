const API_BASE_URL = 'https://cston.onrender.com/api';

async function authenticateTelegram(data) {
    const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
}

function redirectToDashboard(token, username) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    window.location.href = `/dashboard`;
}

function clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/';
}

async function fetchTeamStatus() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const response = await fetch(`${API_BASE_URL}/player/team`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    } catch (error) {
        console.error('Error fetching team status:', error);
        return { hasTeam: false };
    }
}

function setupUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loggedInAs = document.getElementById('logged-in-as');
    const usernameSpan = document.getElementById('username');
    const teamInfo = document.getElementById('team-info');

    loginBtn.addEventListener('click', () => {
        const telegramLoginUrl = `https://t.me/CSTON_BOT?start=login`;
        window.open(telegramLoginUrl, '_self');
    });

    logoutBtn.addEventListener('click', () => {
        clearUserSession();
    });
}

async function initializeApp() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        document.getElementById('logged-in-as').style.display = 'block';
        document.getElementById('username').textContent = username;

        const teamStatus = await fetchTeamStatus();
        if (teamStatus.hasTeam) {
            document.getElementById('team-info').innerHTML = `
                <h3>${teamStatus.team.name}</h3>
                <p>Nationality: ${teamStatus.team.nationality}</p>
                <ul>
                    ${teamStatus.team.players.map(player => `
                        <li>${player.name} (${player.position}) - Skill: ${player.skillLevel}</li>
                    `).join('')}
                </ul>`;
        } else {
            teamInfo.innerHTML = 'No team yet.';
        }
    } else {
        document.getElementById('login-btn').style.display = 'block';
    }
}

initializeApp();
