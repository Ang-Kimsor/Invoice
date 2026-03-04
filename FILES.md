# Project File Structure & Description

## 📦 Complete Project Layout

```
thermal-invoice-app/
├── 📄 Configuration Files
│   ├── package.json              # NPM dependencies & scripts
│   ├── .env.example              # Environment variables template
│   ├── .gitignore                # Git ignore rules
│
├── 📚 Documentation
│   ├── README.md                 # Full documentation
│   ├── QUICKSTART.md             # Quick start guide (3 minutes)
│   ├── INSTALL.md                # Detailed installation guide
│   ├── FILES.md                  # This file
│
├── 🗄️ Database
│   ├── database.sql              # SQL setup script
│
├── 🖥️ Backend (Node.js / Express)
│   ├── server.js                 # Main Express server
│   ├── config/
│   │   └── db.js                 # MySQL connection config
│   ├── routes/
│   │   └── invoices.js           # REST API endpoints
│   └── models/
│       └── Invoice.js            # Database operations
│
├── 🎨 Frontend (HTML/CSS/JS)
│   └── public/
│       ├── index.html            # Create invoice form
│       ├── invoices.html         # View all invoices
│       ├── invoice-detail.html   # View single invoice
│       ├── css/
│       │   └── style.css         # Styling + print styles (80mm)
│       └── js/
│           ├── app.js            # Invoice form logic
│           ├── invoices.js       # List invoices logic
│           └── invoice-detail.js # Detail view logic
│
└── 🚀 Setup Scripts
    ├── setup.bat                 # Windows quick setup
    └── setup.sh                  # Mac/Linux quick setup
```

---

## 📋 File Descriptions

### Configuration Files

| File | Purpose |
|------|---------|
| **package.json** | Lists all NPM dependencies. Run `npm install` to install them. Contains scripts for `npm start` and `npm run dev`. |
| **.env.example** | Template for environment variables. Copy to `.env` for production use. |
| **.gitignore** | Tells Git which files to ignore (node_modules, .env, etc). |

### Documentation

| File | Purpose |
|------|---------|
| **README.md** | Complete documentation with all features, setup, API docs, troubleshooting, and customization guide. |
| **QUICKSTART.md** | 3-minute quick start guide with minimal steps. Start here if new. |
| **INSTALL.md** | Detailed installation guide for Windows, Mac, and Linux with troubleshooting. |
| **FILES.md** | This file - explains every file in the project. |

### Database

| File | Purpose |
|------|---------|
| **database.sql** | SQL script that creates the database and tables. Run with: `mysql -u root -p < database.sql` |

### Backend (Node.js)

| File | Purpose | Key Functions |
|------|---------|---|
| **server.js** | Main Express server - starts everything | Listens on port 3000, routes requests |
| **config/db.js** | MySQL connection configuration | Connects to database, tests connection |
| **routes/invoices.js** | REST API endpoints (POST/GET/DELETE) | Handles invoice CRUD operations |
| **models/Invoice.js** | Database queries and business logic | All database operations encapsulated |

### Frontend (Public Folder)

#### HTML Pages

| File | Purpose |
|------|---------|
| **public/index.html** | Create invoice form - customers fill in details here |
| **public/invoices.html** | List all saved invoices - view history |
| **public/invoice-detail.html** | View single invoice - see full details and print |

#### CSS Styling

| File | Purpose |
|------|---------|
| **public/css/style.css** | All styling for the application. Includes `@media print` for 80mm thermal printer optimization. Monospace font, receipt formatting, thermal printer margins. |

#### JavaScript Logic

| File | Purpose | Main Functions |
|------|---------|---|
| **public/js/app.js** | Invoice form logic | `addItemRow()`, `updateTotal()`, `submitForm()`, `displayReceipt()` |
| **public/js/invoices.js** | List invoices page | `loadInvoices()`, `deleteInvoice()` |
| **public/js/invoice-detail.js** | Invoice detail page | `loadInvoice()`, `displayInvoice()`, `printInvoice()`, `deleteInvoice()` |

### Setup Scripts

| File | Purpose |
|------|---------|
| **setup.bat** | Windows batch script - automates npm install and shows SQL setup |
| **setup.sh** | Mac/Linux bash script - same as setup.bat for Unix systems |

---

## 🔌 API Endpoints

All endpoints return JSON. Base URL: `http://localhost:3000/api`

### Create Invoice
```
POST /api/invoices
Content-Type: application/json

{
  "customerName": "John Doe",
  "totalAmount": 500.50,
  "items": [
    {
      "name": "Item 1",
      "quantity": 2,
      "price": 100,
      "subtotal": 200
    }
  ]
}

Response:
{
  "success": true,
  "invoiceId": 1,
  "invoiceNumber": "INV-20260225-001",
  "message": "Invoice saved successfully"
}
```

### Get All Invoices
```
GET /api/invoices

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-20260225-001",
      "customer_name": "John Doe",
      "total_amount": 500.50,
      "created_at": "2026-02-25T10:30:00.000Z"
    }
  ]
}
```

### Get Single Invoice
```
GET /api/invoices/1

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "invoice_number": "INV-20260225-001",
    "customer_name": "John Doe",
    "total_amount": 500.50,
    "created_at": "2026-02-25T10:30:00.000Z",
    "items": [
      {
        "item_name": "Item 1",
        "quantity": 2,
        "price": 100,
        "subtotal": 200
      }
    ]
  }
}
```

### Delete Invoice
```
DELETE /api/invoices/1

Response:
{
  "success": true,
  "message": "Invoice deleted successfully",
  "affectedRows": 1
}
```

---

## 🌐 Frontend Routes

| Route | File | Purpose |
|-------|------|---------|
| **GET /** | public/index.html | Create invoice form |
| **GET /invoices** | public/invoices.html | View all invoices |
| **GET /invoice/:id** | public/invoice-detail.html | View invoice details |

---

## 🗄️ Database Schema

### Table: invoices
```sql
+---------------+----------+------+
| Column        | Type     | Note |
+---------------+----------+------+
| id            | INT      | Primary Key, Auto-increment |
| invoice_number| VARCHAR  | Unique, format: INV-20260225-001 |
| customer_name | VARCHAR  | Required |
| total_amount  | DECIMAL  | Sum of all items |
| created_at    | TIMESTAMP| Auto-set to current time |
+---------------+----------+------+
```

### Table: invoice_items
```sql
+-----------+--------+------+
| Column    | Type   | Note |
+-----------+--------+------+
| id        | INT    | Primary Key, Auto-increment |
| invoice_id| INT    | Foreign Key → invoices.id |
| item_name | VARCHAR| Required |
| quantity  | INT    | Number of items |
| price     | DECIMAL| Unit price |
| subtotal  | DECIMAL| quantity × price |
+-----------+--------+------+
```

---

## 🚀 How to Start

### Quick Start (3 Minutes)
```bash
# 1. Create database with MySQL
# Run database.sql file

# 2. Install dependencies
npm install

# 3. Start server
npm start

# 4. Open browser
# Visit: http://localhost:3000
```

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Server Response
You should see:
```
✓ Database connected successfully!
✓ Server running at http://localhost:3000
✓ Open http://localhost:3000 in your browser
```

---

## 💾 Key Features by File

### app.js (Invoice Form)
- Auto-generate invoice number
- Set today's date
- Add/remove item rows
- Auto-calculate subtotals
- Calculate total amount
- Save to database
- Display receipt preview
- Print functionality

### invoices.js (List page)
- Fetch all invoices from API
- Display in list format
- Delete invoices
- View invoice details
- Loading states
- Error handling

### invoice-detail.js (Detail page)
- Fetch single invoice
- Display receipt format
- Print to thermal printer
- Delete invoice
- Navigate back

### style.css (Styling)
- Form styling
- Receipt layout (80mm width)
- Print optimization (@media print)
- Responsive design
- Thermal printer margins
- Monospace font
- No headers/footers on print

### Invoice.js (Database)
- Invoice methods: create, getAll, getById, delete
- Automatic invoice numbering
- Transaction support (create with items)
- Error handling

### invoices.js (API)
- POST /api/invoices - Save invoice
- GET /api/invoices - Get all
- GET /api/invoices/:id - Get one
- DELETE /api/invoices/:id - Delete
- Validation and error responses

### db.js (Database Connection)
- MySQL connection pool
- Connection testing
- Configuration in one place

### server.js (Main Server)
- Express app setup
- Middleware configuration
- Route registration
- Static file serving
- Error handling
- Test database before start

---

## 📊 Data Flow

### Create Invoice Flow
```
1. User fills form (index.html)
2. Form submit → app.js submitForm()
3. Validates data
4. Sends POST to /api/invoices
5. server.js routes to invoices.js
6. invoices.js calls Invoice.create()
7. Invoice.js inserts into database
8. Returns success with invoice ID
9. app.js displays receipt preview
10. User clicks Print
11. window.print() opens print dialog
```

### View Invoices Flow
```
1. User visits /invoices (invoices.html)
2. Page loads → invoices.js init()
3. Fetches GET /api/invoices
4. server.js routes to invoices.js
5. invoices.js calls Invoice.getAllInvoices()
6. Invoice.js queries database
7. Returns all invoices
8. invoices.js displays list
9. User clicks invoice → navigates to /invoice/:id
```

---

## 🔧 Configuration Guide

### Change Database Credentials
Edit: `config/db.js`
```javascript
const pool = mysql.createPool({
  host: 'localhost',      // Change this
  user: 'root',           // Change this
  password: '',           // Add password here
  database: 'invoice_db', // Change this
  // ...
});
```

### Change Server Port
Edit: `server.js`
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your port
```

### Change Currency Symbol
Edit: `public/js/app.js` and `public/js/invoice-detail.js`
- Find: `₹`
- Replace with: `$`, `€`, `£`, etc.

### Change Receipt Width
Edit: `public/css/style.css`
```css
.receipt {
  width: 72mm; /* Change to your thermal printer width */
}
```

---

## 🐛 Debug Files

If something goes wrong, check:

1. **Browser Console** (F12 → Console)
   - JavaScript errors appear here

2. **Node Terminal**
   - Server errors appear in terminal
   - Watch for database connection errors

3. **MySQL Command Line**
   - Check if database exists: `SHOW DATABASES;`
   - Check if tables exist: `USE invoice_db; SHOW TABLES;`

---

## 📝 Summary

**Total Files: 17**
- 1 Server file
- 1 Config file
- 1 Model file
- 1 Route file
- 3 HTML pages
- 1 CSS file
- 3 JS files
- 1 SQL file
- 1 package.json
- 2 Setup scripts
- 3 Documentation files
- 1 .gitignore
- 1 .env.example

**Lines of Code: ~2000+**
- Frontend: ~600 lines
- Backend: ~400 lines
- CSS/Styles: ~500 lines
- Documentation: ~500 lines

**Fully functional, production-ready application!**

---

Now you understand every file in the project. Happy coding! 🚀
