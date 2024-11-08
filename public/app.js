```javascript
document.getElementById('login-button').addEventListener('click', () => {
  // Redirect user to Telegram authentication endpoint
  window.location.href = '/api/auth/telegram';
});
```

### Instructions for Deploying
- Ensure that these files (`index.html`, `style.css`, `app.js`) are located in the `/public` directory of your project repository.
- These files are static resources, and Express is configured to serve them correctly through the updated `server.js` code.

- You should now be able to deploy, and your server should properly serve its frontend as well.
