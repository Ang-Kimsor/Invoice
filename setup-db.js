// SQLite Database Setup Script
// Run this once to create the SQLite database and tables

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'invoice_db.sqlite');

// Create or open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    total_amount REAL NOT NULL,
    created_at TEXT DEFAULT DATETIME('now', '+7 hours'),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER,
    sku TEXT,
    description TEXT,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_type TEXT CHECK(unit_type IN ('BOX','CTN','FOC')),
    original_unit TEXT,
    price REAL NOT NULL,
    subtotal REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_invoice_number ON invoices(invoice_number);
  CREATE INDEX IF NOT EXISTS idx_customer_name ON invoices(customer_name);
  CREATE INDEX IF NOT EXISTS idx_invoice_date ON invoices(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_invoice_items_id ON invoice_items(invoice_id);
`;

// Execute each statement separately
const statements = createTablesSQL.split(';').filter(s => s.trim());

let completed = 0;

statements.forEach((statement) => {
  if (statement.trim()) {
    db.run(statement, (err) => {
      if (err) {
        console.error('Error executing statement:', err);
      } else {
        completed++;
        if (completed === statements.length) {
          console.log('\n✓ All tables created successfully!');
          console.log(`✓ Database file: ${dbPath}\n`);

          // List tables
          db.all(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
            (err, rows) => {
              if (err) {
                console.error('Error:', err);
              } else {
                console.log('Tables created:');
                rows.forEach(row => console.log(`  - ${row.name}`));
              }
              db.close();
            }
          );
        }
      }
    });
  }
});

db.on('error', (err) => {
  console.error('Database error:', err);
  process.exit(1);
});
