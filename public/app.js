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

async function initializeApp() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        document.getElementById('logged-in-as').textContent = `Logged in as ${username}`;
        const teamStatus = await fetchTeamStatus();
        if (teamStatus.hasTeam) {
            document.getElementById('team-info').innerText = `Team: ${teamStatus.team.name}`;
        } else {
            document.getElementById('team-info').innerText = 'No team yet.';
        }
    } else {
        document.getElementById('login-btn').addEventListener('click', async () => {
            const telegramData = { /* simulate Telegram data */ };
            const { token, username } = await authenticateTelegram(telegramData);
            redirectToDashboard(token, username);
        });
    }
}

initializeApp();
