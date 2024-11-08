document.getElementById('login-button').addEventListener('click', () => {
    // Redirect user to Telegram authentication endpoint
    window.location.href = '/api/auth/telegram';
});
