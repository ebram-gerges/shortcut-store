#!/bin/bash

echo "🚀 Starting deployment process..."

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt

# Build React frontend
echo "📦 Building React frontend..."
cd frontend
npm install
npm run build

# Copy React build to Django static
echo "📁 Copying React build to Django static..."
cp -r dist/* ../static/

# Go back to root
cd ..

# Collect static files
echo "📂 Collecting Django static files..."
python manage.py collectstatic --noinput

# Setup database and run migrations
echo "🗄️ Setting up database..."
python setup_database.py

echo "✅ Deployment preparation complete!"
echo "🌐 Your app is ready to be deployed!"
echo ""
echo "📋 Environment variables needed:"
echo "   DJANGO_SETTINGS_MODULE=shortcut.settings_production"
echo "   SECRET_KEY=your-secret-key"
echo "   DB_NAME=shortcut_store"
echo "   DB_USER=your-mysql-user"
echo "   DB_PASSWORD=your-mysql-password"
echo "   DB_HOST=your-mysql-host"
echo "   DB_PORT=3306"
echo "   ALLOWED_HOSTS=your-domain.com"
echo "   EMAIL_HOST_USER=shortcut756@gmail.com"
echo "   EMAIL_HOST_PASSWORD=wijpdbtlxdfseuxq" 