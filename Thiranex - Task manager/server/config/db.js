const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, '..', process.env.DB_PATH) 
  : path.resolve(__dirname, '../database.sqlite');

console.log(`Connecting to SQLite database at: ${dbPath}`);

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

module.exports = db;
