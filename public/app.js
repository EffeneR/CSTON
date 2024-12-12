const API_BASE_URL = 'https://cston.onrender.com/api';

async function authenticateTelegram(data) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error('Error during Telegram authentication:', error);
    }
}

function redirectToDashboard(token, username) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    window.location.href = '/dashboard';
}

function setupUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    loginBtn.addEventListener('click', () => {
        // Trigger Telegram Login
        const telegramLoginUrl = `https://t.me/CSTON_BOT?start=login`;
        window.open(telegramLoginUrl, '_self');
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });
}

async function initializeApp() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        document.getElementById('username').textContent = username;
        document.getElementById('logged-in-as').style.display = 'block';
    } else {
        document.getElementById('login-btn').style.display = 'block';
    }
}

initializeApp();
