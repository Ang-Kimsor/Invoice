// Main Express server for Invoice Application
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { testConnection, db } = require('./config/db');
const invoiceRoutes = require('./routes/invoices');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
// All invoice operations go through /api/invoices
app.use('/api/invoices', invoiceRoutes);
// All product operations go through /api/products
app.use('/api/products', productRoutes);

// Home route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Invoices list page
app.get('/invoices', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'invoices.html'));
});

// Invoice detail page
app.get('/invoice/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'invoice-detail.html'));
});

// Report page
// app.get('/report.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'report.html'));
// });

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'report.html'));
});
// Product page
app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize SQLite database and start server
async function start() {
  try {
    // Test database connection first
    await testConnection();

    // Create tables if they don't exist
    db.serialize(() => {
      // Create products table

      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        product_name TEXT NOT NULL,
        description TEXT,
        unit_price REAL NOT NULL,
        box_price REAL NOT NULL,
        ctn_price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create invoices table
      db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        total_amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create or alter invoice_items table to store unit details and descriptions
      db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        product_id INTEGER,
        sku TEXT,
        description TEXT,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_type TEXT CHECK(unit_type IN ('BOX', 'CTN', 'FOC')),
        original_unit TEXT,
        price REAL NOT NULL,
        subtotal REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`);

      // Migrate existing tables by adding missing columns
      const columnsToAdd = [
        { col: 'product_id', type: 'INTEGER' },
        { col: 'sku', type: 'TEXT' },
        { col: 'description', type: 'TEXT' },
        { col: 'unit_type', type: 'TEXT' },
        { col: 'original_unit', type: 'TEXT' }
      ];

      columnsToAdd.forEach(col => {
        db.run(`ALTER TABLE invoice_items ADD COLUMN ${col.col} ${col.type}`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.log(`Note: Column ${col.col} may already exist or couldn't be added`);
          }
        });
      });

      // Create indexes for products
      db.run(`CREATE INDEX IF NOT EXISTS idx_sku ON products(sku)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_product_name ON products(product_name)`);

      // Create indexes for invoices
      db.run(`CREATE INDEX IF NOT EXISTS idx_invoice_number ON invoices(invoice_number)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_customer_name ON invoices(customer_name)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_invoice_date ON invoices(created_at DESC)`);

      // Create indexes for invoice_items
      db.run(`CREATE INDEX IF NOT EXISTS idx_invoice_id ON invoice_items(invoice_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_product_id ON invoice_items(product_id)`);
    });

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n✓ Server running at http://localhost:${PORT}`);
      console.log('✓ Open http://localhost:3000 in your browser');
      console.log('✓ Press Ctrl+C to stop the server\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

