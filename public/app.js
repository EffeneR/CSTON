document.getElementById('login-button').addEventListener('click', async () => {
    try {
        // Make a request to the backend for Telegram login
        const response = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: '<user-id>', // Replace with actual user ID from Telegram login
                username: '<username>', // Replace with actual username from Telegram login
                hash: '<hash>' // Replace with the hash received for verification
            })
        });

        if (response.ok) {
            const { token } = await response.json();
            // Save token to localStorage for future use
            localStorage.setItem('token', token);
            // Redirect to the dashboard
            window.location.href = '/dashboard';
        } else {
            console.error('Login failed:', response.statusText);
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login.');
    }
});
