const Database = require('better-sqlite3'); // Importing the better-sqlite3 package for SQLite database operations
const path = require('path'); // Importing the path module to handle file paths


const db = new Database(path.join(__dirname, 'data.db'));// Create or open the SQLite database file 'data.db'

// CREATE "USER" TABLE
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL 
  )
`).run();

// CREATE "TASK" TABLE
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

module.exports = db; // Export the database instance for use in other modules

// Documentation:

//  Sets up SQLite database using better-sqlite3.
//  Creates two tables:
//  - users: stores username and password
//  - tasks: stores tasks linked to a user via user_id

//  Uses:
//  - db.prepare().run() → creates tables if not exist
//  - module.exports → makes db accessible to other files

// Linked via:
// tasks.user_id → users.id (foreign key)


