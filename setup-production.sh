#!/bin/bash

# Production Setup Script for ordinateurstore.ma
# This script helps set up the production environment

echo "🚀 Setting up production environment for ordinateurstore.ma"

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
    chmod 755 uploads
    echo "✅ Uploads directory created"
else
    echo "✅ Uploads directory already exists"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        echo "📋 Copying .env.production to .env..."
        cp .env.production .env
        echo "⚠️  Please edit .env file with your actual configuration values"
    else
        echo "❌ No .env.production template found"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

echo ""
echo "🎉 Production setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your actual configuration"
echo "2. Set up your database and import database/store.sql"
echo "3. Start the backend server: cd backend && npm start"
echo "4. Start the frontend server: npm start"
echo ""
echo "For troubleshooting, see DEPLOYMENT_FIXES.md"
