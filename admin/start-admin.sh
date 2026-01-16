#!/bin/bash

# Admin Panel Startup Script for Verdelle Nails
# This script installs dependencies and starts the admin panel

echo "🎨 Verdelle Nails Admin Panel"
echo "================================"
echo ""

# Navigate to admin directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting admin panel on http://localhost:3001"
echo "📊 Make sure the backend is running on http://localhost:8000"
echo ""

# Start the development server
npm start
