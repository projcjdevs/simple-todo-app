// In dashboard.js
// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
  console.log("Dashboard page loaded");
  
  // Check if user is logged in using session
  fetch('/api/check-session')
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        // Not logged in, redirect
        window.location.href = '/auth.html';
        throw new Error('Not authenticated');
      }
    })
    .then(userData => {
      // User is authenticated, update UI
      updateUserInterface(userData);
    })
    .catch(error => {
      console.error('Session check error:', error);
    });
});

// Function to update UI with user data
function updateUserInterface(userData) {
  const greetingTitle = document.querySelector('.greeting-title');
  if (greetingTitle && userData.username) {
    greetingTitle.textContent = `Welcome back, ${userData.username}!`;
  }
}