#!/bin/bash

echo "🚀 Starting deployment process..."

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

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt

# Collect static files
echo "📂 Collecting Django static files..."
python manage.py collectstatic --noinput

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create superuser if needed (uncomment if needed)
# echo "👤 Creating superuser..."
# python manage.py createsuperuser --noinput

echo "✅ Deployment preparation complete!"
echo "🌐 Your app is ready to be deployed!" 