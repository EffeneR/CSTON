const API_BASE_URL = 'https://cston.onrender.com/api';

function clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    initializeApp();
}

function storeTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const username = urlParams.get('username');
    if (token && username) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        window.history.replaceState({}, document.title, '/'); // Clean URL
    }
}

async function fetchTeamStatus() {
    const token = localStorage.getItem('token');
    if (!token) return { hasTeam: false };

    const response = await fetch(`${API_BASE_URL}/player/team`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
}

function setupUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loggedInAs = document.getElementById('logged-in-as');
    const usernameSpan = document.getElementById('username');

    loginBtn.addEventListener('click', () => {
        const redirectUrl = encodeURIComponent(window.location.origin);
        const tgLoginUrl = `https://t.me/CSTON_BOT?start=auth_${redirectUrl}`;
        window.open(tgLoginUrl, '_blank'); // Open Telegram login flow
    });

    logoutBtn.addEventListener('click', () => {
        clearUserSession();
    });
}

async function initializeApp() {
    storeTokenFromURL(); // Check for token in URL and store it
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token && username) {
        document.getElementById('telegram-login-container').style.display = 'none';
        document.getElementById('logged-in-as').style.display = 'block';
        document.getElementById('username').textContent = username;
    } else {
        document.getElementById('telegram-login-container').style.display = 'block';
        document.getElementById('logged-in-as').style.display = 'none';
    }
}

initializeApp();
