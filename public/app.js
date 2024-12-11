const API_BASE_URL = 'https://cston.onrender.com'; // Ensure this matches your Render deployment URL
const TELEGRAM_BOT_USERNAME = 'CSTON_BOT'; // Your Telegram bot's username

function clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/';
}

function setupUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    loginBtn.addEventListener('click', () => {
        const redirectUrl = encodeURIComponent(`${API_BASE_URL}/api/auth/telegram`);
        const tgLoginUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=auth_${redirectUrl}`;
        window.location.href = tgLoginUrl;
    });

    logoutBtn.addEventListener('click', () => {
        clearUserSession();
    });
}

async function initializeApp() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');

    if (token && username) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        window.location.href = '/dashboard';
    } else if (window.location.pathname === '/dashboard') {
        const savedToken = localStorage.getItem('token');
        const savedUsername = localStorage.getItem('username');

        if (!savedToken || !savedUsername) {
            window.location.href = '/';
        } else {
            document.getElementById('logged-in-as').style.display = 'block';
            document.getElementById('username').textContent = savedUsername;
        }
    }
}

setupUI();
initializeApp();
