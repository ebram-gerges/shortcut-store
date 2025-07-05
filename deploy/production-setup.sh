#!/bin/bash

# Production Setup Script for Shortcut Store
# This script sets up the production environment on Ubuntu 22.04

set -e  # Exit on any error

echo "🚀 Starting production setup for Shortcut Store..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib redis-server nginx git curl

# Start and enable services
print_status "Starting and enabling services..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Create database and user
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE shortcut_store;
CREATE USER shortcut_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE shortcut_store TO shortcut_user;
ALTER USER shortcut_user CREATEDB;
\q
EOF

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /var/www/shortcutstore
sudo chown $USER:$USER /var/www/shortcutstore

# Copy application files (assuming script is run from project root)
print_status "Copying application files..."
cp -r . /var/www/shortcutstore/
cd /var/www/shortcutstore

# Create virtual environment
print_status "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
sudo mkdir -p /var/log/gunicorn /var/log/celery
sudo chown -R $USER:$USER /var/log/gunicorn /var/log/celery

# Copy configuration files
print_status "Copying configuration files..."
sudo cp systemd/*.service /etc/systemd/system/
sudo cp nginx/shortcut-store.conf /etc/nginx/sites-available/shortcut-store
sudo cp logrotate/django.conf /etc/logrotate.d/django

# Enable Nginx site
print_status "Configuring Nginx..."
sudo ln -sf /etc/nginx/sites-available/shortcut-store /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Set up environment variables
print_status "Setting up environment variables..."
cp env.example .env
print_warning "Please edit .env file with your actual values before continuing"

# Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput

# Run database migrations
print_status "Running database migrations..."
python manage.py migrate

# Create superuser
print_status "Creating superuser..."
python manage.py shell << EOF
from accounts.models import User
if not User.objects.filter(email='admin@example.com').exists():
    User.objects.create_superuser(
        email='admin@example.com',
        password='admin123',
        username='admin'
    )
    print("Superuser created: admin@example.com / admin123")
else:
    print("Superuser already exists")
EOF

# Reload systemd and enable services
print_status "Enabling systemd services..."
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl enable celery
sudo systemctl enable celery-beat

# Start services
print_status "Starting services..."
sudo systemctl start gunicorn
sudo systemctl start celery
sudo systemctl start celery-beat

# Set up logrotate
print_status "Setting up log rotation..."
sudo logrotate -f /etc/logrotate.d/django

# Final status check
print_status "Checking service status..."
sudo systemctl status gunicorn --no-pager
sudo systemctl status celery --no-pager
sudo systemctl status celery-beat --no-pager
sudo systemctl status nginx --no-pager

print_status "Production setup completed!"
print_warning "Don't forget to:"
print_warning "1. Edit .env file with your actual values"
print_warning "2. Configure SSL certificate (Let's Encrypt)"
print_warning "3. Set up firewall rules"
print_warning "4. Configure backups"
print_warning "5. Monitor system resources"

echo "🌐 Your application should now be running at http://yourdomain.com" 