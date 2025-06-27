#!/bin/bash

echo "🚀 Railway Build Script Starting..."

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

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

echo "✅ Railway build complete!" 