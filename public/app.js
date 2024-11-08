document.getElementById('login-button').addEventListener('click', () => {
    window.location.href = '/api/auth/telegram';
});

// Register a new user
function registerUser() {
    const username = document.getElementById('username').value;
    if (username) {
        fetch('/register', {
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
    fetch('/lobby', {
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
        fetch('/createBattle', {
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
