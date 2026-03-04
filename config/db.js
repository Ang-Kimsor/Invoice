// Database connection configuration (SQLite)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file location (creates in project root)
const dbPath = path.join(__dirname, '..', 'invoice_db.sqlite');

// Create or open SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('✗ Database connection failed:', err.message);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Test database connection
async function testConnection() {
  return new Promise((resolve, reject) => {
    db.get('SELECT 1', (err) => {
      if (err) {
        console.error('✗ Database connection failed:', err.message);
        process.exit(1);
      } else {
        console.log('✓ Database connected successfully! (SQLite)');
        console.log(`✓ Database file: ${dbPath}`);
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  testConnection
};
