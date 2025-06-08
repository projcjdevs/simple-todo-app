// Required Packages 
const express = require('express');
const path = require('path');
const db = require('./db/db'); // connecting to the database module
const jwt = require('jsonwebtoken'); // Add this package for token generation
const bcrypt = require('bcrypt'); // Add this package for password hashing

// Creating an instance of the Express app = basically a web server
const app = express();
const PORT = 3000; // Port number for the server
const JWT_SECRET = 'your-secret-key-should-be-long-and-secure'; // Secret key for JWT tokens

// Middleware (data handling) 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lp.html'));
});

// Helper function to generate JWT tokens
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// Helper function to verify JWT tokens
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return null;
  }
}

// AUTHENTICATION ROUTES
// Registration route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with hashed password
    const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
    
    // Generate token for automatic login after registration
    const token = generateToken(result.lastInsertRowid);

    res.status(200).json({ 
      message: 'User registered successfully',
      token: token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user from database
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate authentication token
    const token = generateToken(user.id);

    // Send token to client
    res.status(200).json({ 
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user info
app.get('/api/user/me', (req, res) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  // Verify token and extract userId
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Get user data from database
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Return user data (excluding password)
  res.status(200).json(user);
});

// TASK ROUTES
// Middleware to authenticate requests to task routes
function authenticateToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  // Verify token and extract userId
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Add userId to request object for use in route handlers
  req.userId = userId;
  next();
}

// CREATE TASK ROUTE - Adds a new task for a specific user
app.post('/tasks', authenticateToken, (req, res) => {
  // Extract task data from the request body
  const { title, description, priority } = req.body;
  const userId = req.userId; // From authenticateToken middleware
  
  // Validate that required fields are present
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
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

// GET TASKS ROUTE - Retrieves all tasks for the authenticated user
app.get('/tasks', authenticateToken, (req, res) => {
  const userId = req.userId; // From authenticateToken middleware
  
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
app.put('/tasks/:taskId', authenticateToken, (req, res) => {
  // Extract task ID from URL parameters
  const { taskId } = req.params;
  const userId = req.userId; // From authenticateToken middleware
  
  // Check if the task belongs to the authenticated user
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
app.delete('/tasks/:taskId', authenticateToken, (req, res) => {
  // Extract task ID from URL parameters
  const { taskId } = req.params;
  const userId = req.userId; // From authenticateToken middleware
  
  // Check if the task belongs to the authenticated user
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found or you do not have permission' });
  }
  
  // Delete the task from the database
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  
  // Send success response
  res.status(200).json({ message: 'Task deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});