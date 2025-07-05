#!/bin/bash

# Shortcut Store - PostgreSQL Setup Script
# This script installs and configures PostgreSQL for the demo

echo "🐘 Setting up PostgreSQL for Shortcut Store Demo..."
echo "=================================================="

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

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    print_error "Could not detect OS"
    exit 1
fi

print_status "Detected OS: $OS"

# Install PostgreSQL based on OS
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    print_status "Installing PostgreSQL on Ubuntu/Debian..."
    
    # Update package list
    sudo apt update
    
    # Install PostgreSQL
    sudo apt install -y postgresql postgresql-contrib
    
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    print_status "Installing PostgreSQL on CentOS/RHEL/Fedora..."
    
    if command -v dnf &> /dev/null; then
        sudo dnf install -y postgresql postgresql-server postgresql-contrib
        sudo postgresql-setup --initdb
    elif command -v yum &> /dev/null; then
        sudo yum install -y postgresql postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
    else
        print_error "Package manager not found"
        exit 1
    fi
    
elif [[ "$OS" == *"Arch"* ]] || [[ "$OS" == *"CachyOS"* ]]; then
    print_status "Installing PostgreSQL on Arch Linux/CachyOS..."
    sudo pacman -S --noconfirm postgresql
    
else
    print_error "Unsupported OS: $OS"
    print_status "Please install PostgreSQL manually for your OS"
    exit 1
fi

# Start and enable PostgreSQL service
print_status "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check if PostgreSQL is running
if pg_isready -q; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL failed to start"
    exit 1
fi

# Create database and user
print_status "Setting up database and user..."
sudo -u postgres psql -c "CREATE DATABASE shortcut_store_demo;" 2>/dev/null || print_warning "Database might already exist"
sudo -u postgres psql -c "CREATE USER shortcut_user WITH PASSWORD 'demo_password_123';" 2>/dev/null || print_warning "User might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE shortcut_store_demo TO shortcut_user;" 2>/dev/null || print_warning "Privileges might already be granted"

# Configure PostgreSQL for better performance (optional)
print_status "Configuring PostgreSQL for better performance..."

# Backup original config
sudo cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup 2>/dev/null || \
sudo cp /var/lib/pgsql/data/postgresql.conf /var/lib/pgsql/data/postgresql.conf.backup 2>/dev/null || \
print_warning "Could not backup PostgreSQL config"

# Add performance settings
cat << EOF | sudo tee -a /etc/postgresql/*/main/postgresql.conf 2>/dev/null || \
sudo tee -a /var/lib/pgsql/data/postgresql.conf 2>/dev/null || \
print_warning "Could not update PostgreSQL config"

# Performance settings for demo
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

# Restart PostgreSQL to apply changes
print_status "Restarting PostgreSQL to apply configuration..."
sudo systemctl restart postgresql

# Test connection
print_status "Testing database connection..."
if psql -h localhost -U shortcut_user -d shortcut_store_demo -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_warning "Database connection test failed (this is normal if you haven't set up the .env file yet)"
fi

echo ""
print_success "PostgreSQL setup completed!"
echo ""
echo "📋 PostgreSQL Configuration:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: shortcut_store_demo"
echo "  User: shortcut_user"
echo "  Password: demo_password_123"
echo ""
echo "🔧 PostgreSQL Service:"
echo "  Status: sudo systemctl status postgresql"
echo "  Start: sudo systemctl start postgresql"
echo "  Stop: sudo systemctl stop postgresql"
echo "  Restart: sudo systemctl restart postgresql"
echo ""
echo "🚀 Next steps:"
echo "  1. Install Redis: sudo apt install redis-server (Ubuntu/Debian)"
echo "  2. Start Redis: sudo systemctl start redis"
echo "  3. Run the demo: ./run_demo.sh"
echo "" 