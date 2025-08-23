@echo off
REM Production Setup Script for ordinateurstore.ma (Windows)
REM This script helps set up the production environment

echo 🚀 Setting up production environment for ordinateurstore.ma

REM Create uploads directory if it doesn't exist
if not exist "uploads" (
    echo 📁 Creating uploads directory...
    mkdir uploads
    echo ✅ Uploads directory created
) else (
    echo ✅ Uploads directory already exists
)

REM Check if .env file exists
if not exist ".env" (
    if exist ".env.production" (
        echo 📋 Copying .env.production to .env...
        copy .env.production .env
        echo ⚠️  Please edit .env file with your actual configuration values
    ) else (
        echo ❌ No .env.production template found
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file already exists
)

REM Check Node.js version
echo 📦 Checking Node.js version...
node --version

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Build the application
echo 🔨 Building the application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Build successful

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

echo.
echo 🎉 Production setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your actual configuration
echo 2. Set up your database and import database/store.sql
echo 3. Start the backend server: cd backend ^&^& npm start
echo 4. Start the frontend server: npm start
echo.
echo For troubleshooting, see DEPLOYMENT_FIXES.md
pause
