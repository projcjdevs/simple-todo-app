document.addEventListener('DOMContentLoaded', () => {
  // Form switching functionality
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');

  // Show register form when "Register" is clicked
  showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  // Show login form when "Login" is clicked
  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Check if user is already logged in
  const userId = localStorage.getItem('userId');
  if (userId) {
    // User is already logged in, redirect to dashboard
    window.location.href = '/dashboard.html';
  }

  // Handle login form submission
  document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }
    
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }
      
      // Store user info in localStorage
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', username);
      
      // Redirect to dashboard
      window.location.href = '/dashboard.html';
      
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  });

  // Handle register form submission
  document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }
    
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.message || 'Registration failed');
        return;
      }
      
      alert('Registration successful! You can now log in.');
      
      // Switch to login form
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
      
      // Clear the registration form
      document.getElementById('register-username').value = '';
      document.getElementById('register-password').value = '';
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration. Please try again.');
    }
  });
}); 