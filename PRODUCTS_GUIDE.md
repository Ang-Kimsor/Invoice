# Product Management & Invoice Guide

## Overview

This invoice system now includes a comprehensive product management feature that allows you to:
- Create products with SKU, name, description, and tiered pricing (Unit, Box, CTN)
- Select products when creating invoices
- Choose unit type (UNIT, BOX, or CTN) to automatically populate prices
- Generate invoices with product details and pricing

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE NOT NULL,              -- Product SKU/Code (e.g., SKU001)
  product_name TEXT NOT NULL,            -- Product name
  description TEXT,                      -- Product description
  unit_price REAL NOT NULL,              -- Price per unit
  box_price REAL NOT NULL,               -- Price per box
  ctn_price REAL NOT NULL,               -- Price per carton (CTN)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Invoice Items Table (Updated)
```sql
CREATE TABLE invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  product_id INTEGER,                    -- Links to products table
  item_name TEXT NOT NULL,               -- Product name at time of invoice
  quantity INTEGER NOT NULL,             -- Number of units/boxes/cartons
  unit_type TEXT CHECK(unit_type IN ('UNIT', 'BOX', 'CTN')), -- Type selected
  price REAL NOT NULL,                   -- Price per unit/box/ctn
  subtotal REAL NOT NULL,                -- quantity × price
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Features

### 1. Product Management (`/products.html`)

#### Add Product
- **SKU**: Unique product code (e.g., "SKU001", "PROD-A123")
- **Product Name**: Display name of the product
- **Description**: Optional details about the product
- **Pricing Tiers**:
  - Unit Price: Price for a single unit
  - Box Price: Price for a box of units
  - CTN Price: Price for a carton (multiple boxes)

#### Edit Product
- Click the "Edit" button on any product card
- Modify all fields except SKU (immutable for data integrity)
- Prices are case-sensitive in calculations

#### Delete Product
- Click "Delete" to remove a product
- Confirmation required to prevent accidental deletion
- Historical invoice data remains intact

#### Example Products
```
SKU: WIDGET-001
Name: Standard Widget
Unit: $5.00
Box: $45.00 (10 units)
CTN: $400.00 (10 boxes = 100 units)

SKU: DELUXE-A1
Name: Deluxe Component A
Unit: $15.00
Box: $135.00 (10 units)
CTN: $1,200.00 (10 boxes = 100 units)
```

### 2. Invoice Creation with Products

#### Workflow
1. Navigate to **Create Invoice**
2. Enter customer name and contact (optional)
3. For each item:
   - **Select Product**: Choose from dropdown list (shows "SKU - Product Name")
   - **Select Unit Type**: Click UNIT, BOX, or CTN button
   - **Price Auto-fills**: Based on selected unit type
   - **Enter Quantity**: How many units/boxes/cartons
   - **Subtotal Auto-calculates**: Quantity × Price

#### Example Invoice
```
Customer: Acme Corp
Items:
  1. WIDGET-001 - Standard Widget
     2 BOX @ $45.00 = $90.00
  
  2. DELUXE-A1 - Deluxe Component A
     50 UNIT @ $15.00 = $750.00

Total: $840.00
```

### 3. Invoice Display & Printing

#### Receipt Format (80mm Thermal Printer)
```
         INVOICE
Inv #: INV-20260225-001
Date: 2/25/2026

Customer: Acme Corp

2 x BOX @ $45.00
             $90.00
50 x UNIT @ $15.00
            $750.00

         TOTAL
            $840.00
         $840.00

    Thank You!
    Visit Again
```

## API Endpoints

### Products API

#### Add Product
```
POST /api/product/add
Content-Type: application/json

{
  "sku": "WIDGET-001",
  "productName": "Standard Widget",
  "description": "High quality widget",
  "unitPrice": 5.00,
  "boxPrice": 45.00,
  "ctnPrice": 400.00
}
```

#### Get All Products
```
GET /api/product/list

Response:
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "sku": "WIDGET-001",
      "product_name": "Standard Widget",
      "unit_price": 5.00,
      "box_price": 45.00,
      "ctn_price": 400.00
    },
    ...
  ]
}
```

#### Get Product by SKU
```
GET /api/product/{sku}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "WIDGET-001",
    "product_name": "Standard Widget",
    "unit_price": 5.00,
    "box_price": 45.00,
    "ctn_price": 400.00
  }
}
```

#### Update Product
```
PUT /api/product/{id}
Content-Type: application/json

{
  "productName": "Standard Widget (Updated)",
  "description": "Updated description",
  "unitPrice": 5.50,
  "boxPrice": 49.50,
  "ctnPrice": 440.00
}
```

#### Delete Product
```
DELETE /api/product/{id}
```

### Invoices API (Updated)

#### Create Invoice
```
POST /api/invoices
Content-Type: application/json

{
  "customerName": "Acme Corp",
  "totalAmount": 840.00,
  "items": [
    {
      "productId": 1,
      "name": "Standard Widget",
      "sku": "WIDGET-001",
      "quantity": 2,
      "price": 45.00,
      "unitType": "BOX",
      "subtotal": 90.00
    },
    {
      "productId": 2,
      "name": "Deluxe Component A",
      "sku": "DELUXE-A1",
      "quantity": 50,
      "price": 15.00,
      "unitType": "UNIT",
      "subtotal": 750.00
    }
  ]
}
```

## Technical Details

### Frontend Files
- **`public/index.html`**: Updated invoice form with product selection
- **`public/js/app.js`**: Handles product selection, unit type button clicks, and price population
- **`public/products.html`**: New product management interface
- **`public/js/products.js`**: Product CRUD operations and UI
- **`public/invoices.html`**: List invoices (no changes needed)
- **`public/invoice-detail.html`**: View invoice details (displays product info)

### Backend Files
- **`models/Invoice.js`**: Added product management methods:
  - `addProduct()` - Create product
  - `getAllProducts()` - Retrieve all products
  - `getProductBySku()` - Find by SKU
  - `getProductById()` - Find by ID
  - `updateProduct()` - Modify product
  - `deleteProduct()` - Remove product

- **`routes/invoices.js`**: Added 5 new API endpoints (see API section above)

- **`database.sql`**: Updated schema with products table and invoice_items foreign key

## Workflows

### Workflow 1: Setting Up Products
1. Start server: `npm start`
2. Navigate to **Manage Products** tab
3. Add products with SKU, name, and prices for each tier
4. Products are immediately available for invoice creation

### Workflow 2: Creating an Invoice with Products
1. Navigate to **Create Invoice**
2. Enter customer name
3. Click **+ Add Item**
4. Select product from dropdown
5. Click UNIT, BOX, or CTN button (price auto-fills)
6. Enter quantity
7. Subtotal auto-calculates
8. Click **Save Invoice**
9. Review receipt preview
10. Click **Print or Save as PDF**

### Workflow 3: Bulk Pricing Strategy
If you offer volume discounts:
- **UNIT**: Base price for single units (highest per-unit cost)
- **BOX**: Discounted for box quantities (e.g., 10% off)
- **CTN**: Further discounted for carton quantities (e.g., 20% off base)

Example:
- Widget base: $10.00 per UNIT
- Box price: $90.00 (10 units, 10% discount)
- CTN price: $800.00 (10 boxes, 20% discount)

## Tips & Best Practices

1. **Consistent SKU Format**: Use a consistent naming convention
   - Good: "PROD-001", "SKU-ABC", "ITEM-XYZ"
   - Avoid: Mixed formats like "prod1", "PRODUCT_A", "Item-1"

2. **Price Updates**: 
   - When updating product prices, only new invoices reflect the change
   - Historical invoices retain the price at time of creation

3. **Product Deletion**:
   - Can delete products anytime
   - Historical invoices remain intact and display original product info
   - Consider archiving instead of deleting for audit trails

4. **Unit Type Selection**:
   - Always select a unit type before entering quantity
   - Unit type determines which price is used in the invoice

5. **Batch Import**: 
   - Currently manual entry only
   - Future enhancement: CSV import for bulk product creation

## Troubleshooting

**Product dropdown empty?**
- No products created yet
- Navigate to **Manage Products** to add products first

**Unit type buttons disabled?**
- Product not selected yet
- Select a product from the dropdown first

**Price shows 0.00?**
- Unit type not selected
- Click UNIT, BOX, or CTN button to populate price

**Can't edit product?**
- SKU cannot be changed (immutable field)
- Other fields (name, price, description) are editable

**Invoice shows old price?**
- Product price was updated after invoice creation
- Invoices save the price at creation time (correct behavior)

## Future Enhancements

- CSV/Excel import for bulk product creation
- Product categories and search filtering
- Product images/thumbnails
- Stock/inventory tracking
- Automatic reorder alerts
- Product availability calendar
- Advanced pricing rules (tiered discounts, seasonal pricing)

## Database Maintenance

### View all products
```sql
SELECT * FROM products ORDER BY sku;
```

### View products with pricing
```sql
SELECT sku, product_name, unit_price, box_price, ctn_price 
FROM products 
ORDER BY sku;
```

### View products used in invoices
```sql
SELECT DISTINCT p.sku, p.product_name, COUNT(*) as usage_count
FROM products p
JOIN invoice_items ii ON p.id = ii.product_id
GROUP BY p.id
ORDER BY usage_count DESC;
```

### Backup products
```sql
.dump products > products_backup.sql
```
