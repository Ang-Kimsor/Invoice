## QUICK START GUIDE (SQLite Version)

### 2-Minute Setup

#### Step 1: Install Dependencies (1 minute)

Open Command Prompt in the project folder:
```bash
npm install
```

#### Step 2: Start Server (1 minute)

```bash
npm start
```

Then open: **http://localhost:3000**

**That's it! The SQLite database will be created automatically.**

---

## Easy Alternative: Automated Setup

**Windows Users:** Double-click `setup.bat`
**Mac/Linux Users:** Run `bash setup.sh`

---

## Database

No need to setup MySQL anymore!

SQLite creates the database file automatically:
- **File:** `invoice_db.sqlite` (in project root)
- **No server required**
- **No credentials needed**
- **File size:** ~100KB per 1000 invoices

---

## API Endpoints

```
POST   /api/invoices       → Create invoice
GET    /api/invoices       → List all invoices  
GET    /api/invoices/:id   → Get one invoice
DELETE /api/invoices/:id   → Delete invoice
```

---

## Pages

```
GET  /                  → Create invoice form
GET  /invoices          → View all invoices
GET  /invoice/:id       → View invoice details
```

---

## Print to Thermal Printer

1. Create/View invoice
2. Click "Print or Save as PDF"
3. Select your 80mm thermal printer
4. Margins: None
5. Click Print

---

## Troubleshooting

**Port 3000 in use?**
```bash
# Change PORT in server.js line from:
const PORT = process.env.PORT || 3000;
# To:
const PORT = process.env.PORT || 4000;
```

**MySQL connection failed?**
1. Check MySQL is running
2. Verify credentials in `config/db.js`
3. Check database name

**Dependencies won't install?**
```bash
delete node_modules folder
delete package-lock.json
npm install
```

---

## Customization Cheat Sheet

**Change Currency (₹ → $ or €):**
- Open `public/js/app.js`
- Find and replace all `₹` with your symbol

**Change Receipt Width (80mm → 76mm):**
- Open `public/css/style.css`
- Find: `width: 72mm;`
- Change to your width

**Change Company Name:**  
- Open `public/js/app.js` line ~190
- Change "INVOICE" to your company name

---

## Database Backup

```bash
# Backup
mysqldump -u root invoice_db > backup.sql

# Restore
mysql -u root invoice_db < backup.sql
```

---

## Installation Verification

After setup, you should see:
```
✓ Database connected successfully!
✓ Server running at http://localhost:3000
```

If you see errors, check:
1. MySQL is running
2. `npm install` completed
3. Database credentials in `config/db.js`

---

## Files Generated

✓ Backend: server.js, routes, models, config
✓ Frontend: HTML pages, CSS, JavaScript
✓ Database: SQL setup scripts
✓ Documentation: README, this quick start
✓ Configuration: .env.example, package.json

Total: 15+ files, fully functional application

---

Happy invoicing! 📄🖨️
