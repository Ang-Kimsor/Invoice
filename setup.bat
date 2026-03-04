@echo off
REM Quick setup script for Thermal Invoice Application (SQLite) on Windows

echo.
echo ====================================
echo Thermal Invoice App - Setup Script
echo SQLite Database Edition
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/2] Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/2] Starting the server...
echo.
echo The SQLite database will be created automatically!
echo Database file: invoice_db.sqlite
echo.
echo Server should be running at http://localhost:3000
echo Open it in your browser now!
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
pause
