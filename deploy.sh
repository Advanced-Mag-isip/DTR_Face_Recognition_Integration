#!/bin/bash

# Attendance Tracker - Production Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# 2. Install root dependencies (Vite, etc.)
echo "📦 Installing root dependencies..."
npm install

# 3. Build the frontend
echo "🏗️ Building the frontend..."
npm run build

# 4. Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# 5. Run migrations (if using sequelize-cli)
# echo "🗄️ Running database migrations..."
# npx sequelize-cli db:migrate

# 6. Restart the application via PM2
echo "🔄 Restarting the server via PM2..."
pm2 restart server

echo "✅ Deployment complete! Check the status with 'pm2 status'."
