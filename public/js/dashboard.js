document.addEventListener('DOMContentLoaded', function() {
  console.log("Dashboard page loaded");
  
  // Get username from URL parameter or use a default
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username') || 'User';
  
  // Simple fetch to get user data by username
  fetch(`/api/users/by-name/${username}`)
    .then(response => response.json())
    .then(userData => {
      // Update greeting with username
      const greetingTitle = document.querySelector('.greeting-title');
      if (greetingTitle) {
        greetingTitle.textContent = `Welcome back, ${userData.username}!`;
      }
      
      // You can update other elements with user data here
      console.log("User data loaded:", userData);
    })
    .catch(error => {
      console.error('Error loading user data:', error);
      
      // Show generic greeting on error
      const greetingTitle = document.querySelector('.greeting-title');
      if (greetingTitle) {
        greetingTitle.textContent = `Welcome back, ${username}!`;
      }
    });
});