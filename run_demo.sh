#!/bin/bash

# Shortcut Store - Client Demo Setup Script
# This script sets up and runs the entire project locally for client demonstration

set -e  # Exit on any error

echo "🚀 Starting Shortcut Store Client Demo Setup..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    print_error "Please run this script from the shortcut-store root directory"
    exit 1
fi

# Check if PostgreSQL is running
print_status "Checking PostgreSQL status..."
if ! pg_isready -q; then
    print_error "PostgreSQL is not running. Please start PostgreSQL first:"
    echo "  sudo systemctl start postgresql"
    echo "  sudo systemctl enable postgresql"
    exit 1
fi
print_success "PostgreSQL is running"

# Check if Redis is running
print_status "Checking Redis status..."
if ! redis-cli ping > /dev/null 2>&1; then
    print_error "Redis is not running. Please start Redis first:"
    echo "  sudo systemctl start redis"
    echo "  sudo systemctl enable redis"
    exit 1
fi
print_success "Redis is running"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Django Settings
DEBUG=True
SECRET_KEY=demo-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=shortcut_store_demo
DB_USER=shortcut_user
DB_PASSWORD=demo_password_123
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email (for demo, using console backend)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Static files
STATIC_URL=/static/
MEDIA_URL=/media/

# Frontend
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
EOF
    print_success "Created .env file"
else
    print_status ".env file already exists"
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Created virtual environment"
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install psycopg2-binary redis celery

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Set environment variables (skip comments and empty lines)
export $(grep -v '^#' .env | grep -v '^$' | xargs)

# Create database if it doesn't exist
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE shortcut_store_demo;" 2>/dev/null || print_warning "Database might already exist"
sudo -u postgres psql -c "CREATE USER shortcut_user WITH PASSWORD 'demo_password_123';" 2>/dev/null || print_warning "User might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE shortcut_store_demo TO shortcut_user;" 2>/dev/null || print_warning "Privileges might already be granted"

# Run Django migrations
print_status "Running Django migrations..."
export DJANGO_SETTINGS_MODULE=shortcut.settings_demo
python manage.py makemigrations
python manage.py migrate

# Create superuser if it doesn't exist
print_status "Creating demo superuser..."
export DJANGO_SETTINGS_MODULE=shortcut.settings_demo
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@demo.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

# Create demo data
print_status "Creating demo data..."
export DJANGO_SETTINGS_MODULE=shortcut.settings_demo
python manage.py shell -c "
from products.models import Category, Product, ProductSizeVariant, ProductColorVariant
from django.core.files.base import ContentFile
import os

# Create categories
categories = []
for name in ['T-Shirts', 'Shoes', 'Accessories']:
    cat, created = Category.objects.get_or_create(name=name)
    categories.append(cat)
    if created:
        print(f'Created category: {name}')

# Create products
products_data = [
    {
        'name': 'Classic Cotton T-Shirt',
        'description': 'Comfortable cotton t-shirt in various colors',
        'price': 29.99,
        'category': categories[0]
    },
    {
        'name': 'Running Shoes',
        'description': 'Lightweight running shoes for all terrains',
        'price': 89.99,
        'category': categories[1]
    },
    {
        'name': 'Leather Wallet',
        'description': 'Genuine leather wallet with multiple card slots',
        'price': 49.99,
        'category': categories[2]
    }
]

for data in products_data:
    product, created = Product.objects.get_or_create(
        name=data['name'],
        defaults=data
    )
    if created:
        print(f'Created product: {data[\"name\"]}')
        
        # Create variants
        colors = ['Red', 'Blue', 'Black']
        sizes = ['S', 'M', 'L', 'XL']
        
        for color in colors:
            color_variant, _ = ProductColorVariant.objects.get_or_create(
                product=product,
                color=color
            )
            
            for size in sizes:
                ProductSizeVariant.objects.get_or_create(
                    color_variant=color_variant,
                    size=size,
                    defaults={'stock': 10}
                )

print('Demo data created successfully!')
"

# Start Celery worker in background
print_status "Starting Celery worker..."
export DJANGO_SETTINGS_MODULE=shortcut.settings_demo
celery -A shortcut worker --loglevel=info --detach
print_success "Celery worker started"

# Start Celery beat in background
print_status "Starting Celery beat..."
export DJANGO_SETTINGS_MODULE=shortcut.settings_demo
celery -A shortcut beat --loglevel=info --detach
print_success "Celery beat started"

# Start Django development server in background
print_status "Starting Django development server..."
export DJANGO_SETTINGS_MODULE=shortcut.settings_demo
python manage.py runserver 0.0.0.0:8000 --noreload &
DJANGO_PID=$!
echo $DJANGO_PID > django.pid
print_success "Django server started (PID: $DJANGO_PID)"

# Start frontend development server in background
print_status "Starting frontend development server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
cd ..
print_success "Frontend server started (PID: $FRONTEND_PID)"

# Wait a moment for servers to start
sleep 3

# Display demo information
echo ""
echo "🎉 Demo Setup Complete!"
echo "======================"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000/api"
echo "👨‍💼 Admin Panel: http://localhost:8000/admin"
echo "📊 Django Debug Toolbar: http://localhost:8000/debug/"
echo ""
echo "🔑 Admin Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "📋 Demo Features Available:"
echo "  ✅ User registration and authentication"
echo "  ✅ Product browsing and search"
echo "  ✅ Shopping cart functionality"
echo "  ✅ Wishlist management"
echo "  ✅ Order processing"
echo "  ✅ Real-time notifications (Celery)"
echo "  ✅ Redis caching"
echo "  ✅ PostgreSQL database"
echo ""
echo "🛑 To stop the demo, run: ./stop_demo.sh"
echo "🔄 To restart the demo, run: ./restart_demo.sh"
echo ""
echo "📝 Demo Guide:"
echo "  1. Open http://localhost:5173 in your browser"
echo "  2. Register a new account or login with admin/admin123"
echo "  3. Browse products and add items to cart"
echo "  4. Complete checkout process"
echo "  5. Check admin panel for orders and analytics"
echo ""

# Keep script running and show logs
print_status "Demo is running. Press Ctrl+C to stop all services..."
trap 'echo ""; print_warning "Stopping demo..."; ./stop_demo.sh; exit 0' INT

# Show recent logs
tail -f /dev/null 