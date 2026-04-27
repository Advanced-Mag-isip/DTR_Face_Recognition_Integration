#!/bin/bash

# Attendance Tracker - Production Deployment Script
# Usage: ./deploy.sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# 2. Check if we are on the right commit
echo "📍 Current commit: $(git rev-parse --short HEAD)"
git log -1 --pretty=format:"%s"
echo -e "\n"

# 3. Clean and Build the frontend
echo "🧹 Cleaning previous build..."
rm -rf dist

echo "📦 Installing root dependencies..."
npm install --silent

echo "🏗️ Building the frontend..."
npm run build

# 4. Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --silent

# 5. Database Schema Check
# Note: sequelize.sync() doesn't add new columns to existing tables.
# If you added new fields, you MUST run the SQL migrations manually or use:
# npx sequelize-cli db:migrate
echo "🗄️ Note: Ensure your database schema is up to date (check PROJECT_PROGRESS.md SQL section)"

# 6. Restart the application via PM2
echo "🔄 Restarting the server via PM2..."
# We use 'pm2 restart server' but also show status to verify
pm2 restart server || pm2 start server.js --name "server"
pm2 status

echo "✅ Deployment complete! If changes don't appear, try clearing your browser cache."
