document.getElementById('login-button').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Send the data necessary for Telegram authentication
                id: '<user-id>', // Replace with actual user ID (you may get this from Telegram SDK)
                username: '<username>', // Replace with actual username
                hash: '<hash>' // Replace with the hash for verification
            })
        });

        if (response.ok) {
            const { token } = await response.json();
            // Save token and proceed
            localStorage.setItem('token', token);
            window.location.href = '/dashboard'; // Redirect to some dashboard or profile page after successful login
        } else {
            console.error('Login failed:', response.statusText);
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login.');
    }
});
