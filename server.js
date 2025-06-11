// Required Packages 
const express = require('express');
const path = require('path');
const db = require('./db/db'); // connecting to the database module

// Creating an instance of the Express app = basically a web server
const app = express();
const PORT = 3000; // Port number for the server

// Middleware (data handling) 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 

// Root route - Landing Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lp.html'));
});

// Simple user registration - no password hashing
app.post('/register', (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Insert new user with plain password (not secure, but simple)
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password);
    
    // Return success message with the user ID
    res.status(200).json({ 
      message: 'User registered successfully',
      userId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Simple login - no token generation
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user from database
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Send user info to client
    res.status(200).json({ 
      message: 'Login successful',
      userId: user.id,
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user by username (needed for dashboard.js)
app.get('/api/users/by-name/:username', (req, res) => {
  const username = req.params.username;
  
  // Get user data from database
  const user = db.prepare('SELECT id, username FROM users WHERE username = ?').get(username);
  if (!user) {
    // Return a default user object if not found
    return res.json({ username: username });
  }
  
  // Return user data (excluding password)
  res.status(200).json(user);
});

// CREATE TASK ROUTE - Adds a new task for a user
app.post('/tasks/:userId', (req, res) => {
  // Extract task data from the request body
  const { title, description, priority } = req.body;
  const userId = req.params.userId;
  
  // Validate that required fields are present
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  
  // Check if user exists
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Insert the new task into the database
  const result = db.prepare(
    'INSERT INTO tasks (user_id, title, description, priority) VALUES (?, ?, ?, ?)'
  ).run(userId, title, description, priority || 'medium');
  
  // Send success response with the new task ID
  res.status(201).json({ 
    message: 'Task created successfully',
    taskId: result.lastInsertRowid
  });
});

// GET TASKS ROUTE - Retrieves all tasks for a user
app.get('/tasks/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Check if user exists
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Query the database for all tasks that belong to this user
  // Order them by priority (high → medium → low)
  const tasks = db.prepare(`
    SELECT * FROM tasks 
    WHERE user_id = ? 
    ORDER BY 
      CASE priority 
        WHEN "high" THEN 1 
        WHEN "medium" THEN 2 
        WHEN "low" THEN 3 
      END
  `).all(userId);
  
  // Send the tasks back to the client as JSON
  res.status(200).json(tasks);
});

// UPDATE TASK ROUTE - Modifies an existing task
app.put('/tasks/:userId/:taskId', (req, res) => {
  // Extract IDs from URL parameters
  const { userId, taskId } = req.params;
  
  // Check if the task belongs to the user
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found or you do not have permission' });
  }
  
  // Extract updated task data from request body
  const { title, description, priority } = req.body;   
  
  // Update the task in the database
  db.prepare(
    'UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?'
  ).run(title, description, priority, taskId);
  
  // Send success response
  res.status(200).json({ message: 'Task updated successfully' });
});

// DELETE TASK ROUTE - Removes a task
app.delete('/tasks/:userId/:taskId', (req, res) => {
  // Extract IDs from URL parameters
  const { userId, taskId } = req.params;
  
  // Check if the task belongs to the user
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found or you do not have permission' });
  }
  
  // Delete the task from the database
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  
  // Send success response
  res.status(200).json({ message: 'Task deleted successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});