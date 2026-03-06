## Complete Installation Guide (SQLite Edition)

This guide covers setup for Windows, Mac, and Linux. **No database server required!**

---

## Prerequisites Check

### Windows

**Check Node.js:**

```powershell
node --version
npm --version
```

Should show version numbers (e.g., v18.0.0)

**Check MySQL:**

```powershell
mysql --version
```

If not found, MySQL is not in PATH. Check Services for MySQL running.

### Mac/Linux

```bash
node --version
npm --version
```

If any are missing, install Node.js from: https://nodejs.org/

**SQLite is included - no database server needed!**

---

## Node.js Installation (All Platforms)

### Install Node.js

#### Windows

1. Download from: https://nodejs.org/ (LTS version)
2. Run installer
3. Click Next through all steps
4. Accept defaults
5. Complete

**Verify:**

```powershell
node --version
npm --version
```

#### Mac

```bash
# Using Homebrew
brew install node

# Or download DMG from nodejs.org
```

**Verify:**

```bash
node --version
npm --version
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm
```

**Verify:**

```bash
node --version
npm --version
```

---

## Project Installation

### Step 1: Open Terminal/PowerShell

**Windows PowerShell:**

- Right-click Start Menu
- Click Windows PowerShell (Admin)

**Mac/Linux Terminal:**

- Press Cmd+Space, type "terminal"

### Step 2: Navigate to Project

**Windows:**

```powershell
cd C:\Users\namk\Desktop\Recept
```

**Mac/Linux:**

```bash
cd ~/Desktop/Recept
```

### Step 3: Install Dependencies

```bash
npm install
```

This will create a `node_modules` folder with all packages.

**What's being installed:**

- **express** - Web framework
- **mysql2** - Database driver
- **body-parser** - Request parsing
- **nodemon** - Dev tool (auto-restart)

Expect this to take 1-3 minutes.

---

## Database Connection Check

Edit `config/db.js` to match your MySQL setup:

```javascript
const pool = mysql.createPool({
  host: "localhost", // Your host
  user: "root", // Your username
  password: "", // Your password (empty if none)
  database: "invoice_db", // Database name
  // ...
});
```

**Examples:**

```javascript
// No password
password: '',

// With password
password: 'mypassword123',

// Different host
host: '192.168.1.100',

// Different port
port: 3307,
```

---

## Start the Server

### Option 1: Production Mode

```bash
npm start
```

Output should be:

```
✓ Database connected successfully!
✓ Server running at http://localhost:3000
```

### Option 2: Development Mode (Auto-reload)

```bash
npm run dev
```

This uses nodemon to auto-restart on file changes.

### Check if Server Running

Visit: **http://localhost:3000**

Should see the invoice form.

---

## Troubleshooting

### "npm: command not found"

- Node.js not installed
- Install from https://nodejs.org/
- Restart terminal after install

### "Cannot find module 'express'"

```bash
npm install
```

### "EADDRINUSE: address already in use :::3000"

Another app is using port 3000:

```bash
# Change PORT in server.js
const PORT = 4000; // Use 4000 instead
```

### "Error: connect ECONNREFUSED 127.0.0.1:3306"

- MySQL not running
- Windows: Start from Services or MySQL shell
- Mac: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### "Error: Access denied for user 'root'@'localhost'"

- Check password in `config/db.js`
- Test MySQL connection:

```bash
mysql -u root -p
```

### "Error: Unknown database 'invoice_db'"

- Run database setup SQL
- Or: `mysql -u root -p < database.sql`
- Or: Use database.sql file in MySQL Workbench

### "Cannot find module 'nodemon'"

This only happens with `npm run dev`:

```bash
npm install --save-dev nodemon
# Or just use: npm start
```

---

## Environment Variables (Optional)

For security, create `.env` file:

```bash
# Copy example
cp .env.example .env

# Edit .env with your values
```

Then in `server.js`, load environment:

```javascript
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || "localhost";
```

Install dotenv:

```bash
npm install dotenv
```

---

## File Permissions (Mac/Linux)

If you get permission errors:

```bash
# Make setup script executable
chmod +x setup.sh

# Run it
./setup.sh
```

---

## Firewall Issues

### Windows

Windows Firewall may block Node.js:

- When prompted: Allow access
- Or add rule manually in Firewall settings

### Mac

```bash
# Check if blocked
sudo lsof -i :3000

# If blocked, add to firewall:
# System Preferences → Security & Privacy → Firewall Options
```

### Linux

```bash
# Open port (Ubuntu)
sudo ufw allow 3000

# Check status
sudo ufw status
```

---

## Verify Everything Works

### Test 1: Server Running

```
http://localhost:3000
```

Should show form.

### Test 2: Database Working

Create an invoice and save it.
Check should appear in "View Invoices" page.

### Test 3: Print Working

Click "Print or Save as PDF".
Should open print dialog.

---

## Next Steps

1. Update `config/db.js` with your credentials if needed
2. Run database setup SQL
3. Run `npm install`
4. Run `npm start`
5. Visit `http://localhost:3000`
6. Create an invoice
7. Print it to your thermal printer

---

## Uninstall

To completely remove:

```bash
# Remove node_modules
rm -rf node_modules

# Delete database
mysql -u root -p < drop_database.sql
# Or in MySQL: DROP DATABASE invoice_db;
```

---

## Support

If stuck:

1. Check error message carefully
2. Google the error message
3. Verify MySQL is running
4. Check file paths are correct
5. Restart everything
6. Review this guide

Common issues section above has solutions.

Good luck! 🚀
