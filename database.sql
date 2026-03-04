-- SQLite Setup Script for Thermal Invoice Application
-- SQLite creates database automatically on first connection

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  unit_price REAL NOT NULL,
  box_price REAL NOT NULL,
  ctn_price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  total_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  product_id INTEGER,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_type TEXT CHECK(unit_type IN ('UNIT', 'BOX', 'CTN')),
  price REAL NOT NULL,
  subtotal REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_invoice_items_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_customer_name ON invoices(customer_name);
CREATE INDEX IF NOT EXISTS idx_invoice_date ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_product_id ON invoice_items(product_id);

-- Verify tables were created
SELECT 'SQLite Database setup completed successfully!' as message;
