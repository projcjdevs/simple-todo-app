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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// AUTHENTICATION ROUTES
// Registration route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already taken' });
  }

  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password);
  res.status(200).json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // TEMP: just respond with success
  res.status(200).json({ message: 'Login successful', userId: user.id });
});


// TASK ROUTES
// CREATE TASK ROUTE - Adds a new task for a specific user
app.post('/tasks', (req, res) => {
  // Extract task data from the request body
  const { userId, title, description, priority } = req.body;
  
  // Validate that required fields are present
  if (!userId || !title) {
    return res.status(400).json({ message: 'User ID and title are required' });
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


// GET TASKS ROUTE - Retrieves all tasks for a specific user
app.get('/tasks/:userId', (req, res) => {
  // Extract the userId from the URL parameters
  const { userId } = req.params;
  
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
app.put('/tasks/:taskId', (req, res) => {
  // Extract task ID from URL parameters
  const { taskId } = req.params;
  
  // Extract updated task data from request body
  const { title, description, priority } = req.body;   
  
  // Update the task in the database
  db.prepare(
    'UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?'
  ).run(title, description, priority, taskId);
  
  // Send success response
  res.status(200).json({ message: 'Task updated successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Documentation:
// Express is a web framework for Node.js that makes it easier to build web applications and APIs.
// It provides a simple way to handle HTTP requests, define routes, and manage middleware.
// There is no strict way to structure an Express app, but a common pattern is to create an instance of the Express application and then define routes and middleware on that instance.
// Treat the different methods as the tools you use to build your web app.
// Those tools are the middlewares and route handlers that you use to handle requests and responses.

// Commonly, when building an Express app, you start with this default boilerplate code:
// const express = require('express');
// const app = express();
// const path = require('path');
// const PORT = 3000;

// Add middleware to handle data and serve static files:
// Create Routes to handle requests:


// app = is an instance or an object of the express application, because you NEVER call express() 
// twice in the same fileURLToPath, just once and by creating the "app" instance.
// Once you create that instance, you can use it to things like listen, get, post, etc.
// Therefore, the app.<method> sytnax is used to call on methods that you can use to handle requests.

// Examples:
// app.use() = Registers Middlewares - functions that run for every requests or certain paths. Great for parsing, logging, serving static files, etc.
// app.get() = Defines a "route handler" for HTTP GET requests (like when someone visits a page)
// app.post() = Defines a "route handler" for HTTP POST requests  (usually form submissions or APIs sending data to the server)
// app.put() = Handles HTTP PUT requests (usually for updating data)
// app.delete() = Handles HTTP DELETE requests (usually for deleting data)
// app.listen() = Starts your server and listens for incoming requests on a specified port

// app.get() SYNTAX:

// app.get('/some-path', (req, res) => {
     // Your code to handle the request goes here
// });

// app.get() defines a route handler,
// The first argument is the URL path (in this case / = homepage),
// The second argument is a callback function that takes two parameters:
// req (request): contains everything the client sends — URL, headers, query params, body data.
// res (response): methods to reply to the client — send HTML, JSON, status codes, files, redirects.

// Common res methods:
// res.send('Hello') — send a string
// res.json({ name: 'Proj' }) — send JSON data
// res.sendFile('/path/to/file') — send a file like an HTML page
// res.status(404).send('Not found') — send HTTP status + message

// Express waits for a GET request to /some-path, then runs your function to handle it.
// In this case = res.sendFile(path.join(__dirname, 'public', 'index.html'));
// What does thid do?
// res.sendFile() tells express to send an actual file back to the client's browset - in this case, the index.html file.
// path.join() joins folder/file names into a complete file path that works on any OS.
// __dirname is a build-in Node.js variable that gives the absolute path of the current directory where the script is running.
// So, path.join(__dirname, 'public', 'index.html') creates the full path to the index.html file in the 'public' folder.
// This way, when someone visits the root URL (http://localhost:3000/), they get the index.html file.


// What is a middleware?
// Think of middleware as a function that runs before your main route handler.
// Some of the middlewares used is express.static(), express.json(), and express.urlencoded().
// these help read data sent by the client, without them, your server wouldn't know how to handle requests properly.


// What is express.static()?
// built-in Express middleware for serving static assets like HTML, CSS, JS, images, etc.
// It allows you to serve files from a specific directory, making them accessible via URLs.
// For example, app.use(express.static('public')) serves files from the 'public' directory.
// When user requests /dashboard.html, Express looks in 'public' for that file.

// what is express.json()?
// it is a build-in middleware that parses incoming requests with JSON payloads.
// It allows you to access JSON data sent in the request body easily.
// For example, it turns JSON data = {"username" : "Charles"} into req.body.username = "Charles".
// This is useful for APIs or when clients send JSON data to your server.

// What is express.urlencoded()?
// it is a built-in middleware that parses incoming requests with URL-encoded payloads.
// It allows you to access form data sent in the request body easily.
