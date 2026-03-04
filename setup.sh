#!/bin/bash
# Quick setup script for Thermal Invoice Application (SQLite) on Linux/Mac

echo ""
echo "===================================="
echo "Thermal Invoice App - Setup Script"
echo "SQLite Database Edition"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "[ERROR] npm is not installed!"
    exit 1
fi

echo "[1/2] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]
then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi

echo ""
echo "[2/2] Starting the server..."
echo ""
echo "The SQLite database will be created automatically!"
echo "Database file: invoice_db.sqlite"
echo ""
echo "Server should be running at http://localhost:3000"
echo "Open it in your browser now!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
