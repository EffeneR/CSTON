// Login with Telegram
document.getElementById('login-button').addEventListener('click', () => {
    // Redirect to Telegram login
    const botToken = 'YOUR_BOT_TOKEN'; // Replace with your actual bot token
    const botUsername = 'YOUR_BOT_USERNAME'; // Replace with your actual bot username
    window.location.href = `https://t.me/${botUsername}?start=${botToken}`;
});

// Register a new user
function registerUser() {
    const username = document.getElementById('username').value;
    if (username) {
        fetch('/api/register', { // Updated to use a proper API route for registration
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username }),
        })
        .then(response => response.json())
        .then(data => {
            alert(`User registered: ${data.username}`);
        })
        .catch(error => {
            console.error('Error registering user:', error);
        });
    } else {
        alert('Please enter a username');
    }
}

// Get available battles in the lobby
function getLobby() {
    fetch('/api/lobby', { // Updated the API route to a more proper form
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        const lobbyList = document.getElementById('lobbyList');
        lobbyList.innerHTML = '';
        data.battles.forEach(battle => {
            const div = document.createElement('div');
            div.innerText = `Battle: ${battle.name}`;
            lobbyList.appendChild(div);
        });
    })
    .catch(error => {
        console.error('Error getting lobby:', error);
    });
}

// Create a new battle
function createBattle() {
    const battleName = document.getElementById('battleName').value;
    if (battleName) {
        fetch('/api/createBattle', { // Updated API route for battle creation
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: battleName }),
        })
        .then(response => response.json())
        .then(data => {
            alert(`Battle created: ${data.name}`);
        })
        .catch(error => {
            console.error('Error creating battle:', error);
        });
    } else {
        alert('Please enter a battle name');
    }
}
