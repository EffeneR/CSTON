const API_BASE_URL = 'https://cston.onrender.com/api';

async function authenticateTelegram(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error('Error during Telegram authentication:', error);
    }
}

function redirectToPage(token, username, page) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    window.location.href = page;
}

async function checkRedirection() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (!token || !username) return;

    try {
        const response = await fetch(`${API_BASE_URL}/player/team`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.hasTeam) {
            redirectToPage(token, username, '/game-landing');
        } else {
            redirectToPage(token, username, '/team-creation');
        }
    } catch (error) {
        console.error('Error during redirection:', error);
    }
}

function initializeApp() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        document.getElementById('username').textContent = username;
        checkRedirection();
    } else {
        document.getElementById('login-btn').style.display = 'block';
    }
}

initializeApp();
