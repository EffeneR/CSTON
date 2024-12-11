const API_BASE_URL = 'https://cston.onrender.com/api';

// Fetch Player Team Status
async function checkTeamStatus() {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/player/team`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.json();
    } catch (error) {
        console.error('Error checking team status:', error);
        return null;
    }
}

// Create a Team
async function createTeam() {
    const token = localStorage.getItem('jwt');
    const name = document.querySelector('#team-name').value;
    const nationality = document.querySelector('#team-nationality').value;

    try {
        const response = await fetch(`${API_BASE_URL}/team/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, name, nationality })
        });

        const data = await response.json();
        if (data.message === 'Team created successfully') {
            alert('Your team has been created!');
            initializeApp();
        }
    } catch (error) {
        console.error('Error creating team:', error);
    }
}

// Initialize App
async function initializeApp() {
    const teamStatus = await checkTeamStatus();
    if (!teamStatus || !teamStatus.hasTeam) {
        document.querySelector('#create-team').style.display = 'block';
        document.querySelector('#main-content').style.display = 'none';
    } else {
        document.querySelector('#create-team').style.display = 'none';
        document.querySelector('#main-content').style.display = 'block';
    }
}

initializeApp();
