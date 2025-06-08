// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  checkLoginStatus();
  
  // Set up event listeners
  setupEventListeners();
});

// Check if the user is logged in
function checkLoginStatus() {
  // Simple check for auth token in localStorage
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    // No token found, redirect to login page
    console.log('User not logged in. Redirecting to login page...');
    window.location.href = '/auth.html';
    return false;
  }
  
  // User is logged in, load their data
  loadUserData(authToken);
  return true;
}

// Load user data from server
function loadUserData(token) {
  // Display loading state
  const greetingTitle = document.querySelector('.greeting-title');
  if (greetingTitle) {
    greetingTitle.textContent = 'Loading...';
  }
  
  // Fetch user data from your server = ${token} is attached so the server can verify the user
  fetch('/api/user/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      // If server says token is invalid
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/auth.html';
        throw new Error('Invalid authentication');
      }
      throw new Error('Network response error');
    }
    return response.json();
  })
  .then(userData => {
    // Update the greeting with the username
    updateUserInterface(userData);
  })
  .catch(error => {
    console.error('Error:', error);
    // Fallback to generic greeting if there's an error
    if (greetingTitle) {
      greetingTitle.textContent = 'Welcome back!';
    }
  });
}

// Update the UI with user data
function updateUserInterface(userData) {
  // Update welcome message
  const greetingTitle = document.querySelector('.greeting-title');
  if (greetingTitle && userData.username) {
    greetingTitle.textContent = `Welcome back, ${userData.username}!`;
  }
  
  // You can update other elements with user data as needed
  // For example, profile picture, user-specific content, etc.
}

// Set up event listeners
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Clear the token and redirect to login page
      localStorage.removeItem('authToken');
      window.location.href = '/auth.html';
    });
  }
  
  // Add functionality to user button dropdown if needed
  const userBtn = document.querySelector('.user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', function() {
      // Toggle user menu or implement dropdown functionality
      console.log('User button clicked');
    });
  }
}