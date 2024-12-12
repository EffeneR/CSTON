const API_BASE_URL = 'https://cston.onrender.com/api';

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
            window.location.href = '/game-landing';
        } else {
            window.location.href = '/team-creation';
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
