#!/bin/bash

# Database Fix Script for Shortcut Store
# This script will create the PostgreSQL user and database

echo "🔧 Fixing PostgreSQL Database Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
   print_error "This script should not be run as root. Please run as a regular user."
   exit 1
fi

# Variables
DB_USER="shortcut_user"
DB_NAME="shortcut_store"
DB_PASSWORD="ShortcutTest2024!"

print_status "Database Configuration:"
echo "  - Database User: $DB_USER"
echo "  - Database Name: $DB_NAME"
echo "  - Database Password: $DB_PASSWORD"

# Check if PostgreSQL is running
print_status "Checking PostgreSQL status..."
if ! systemctl is-active --quiet postgresql; then
    print_error "PostgreSQL is not running. Starting it..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Try to create the user and database
print_status "Creating PostgreSQL user and database..."

# Method 1: Try with sudo -u postgres
print_status "Attempting to create user with sudo..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || {
    print_warning "User might already exist, trying to update password..."
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || {
        print_error "Failed to create/update user. Trying alternative method..."
    }
}

# Create database
print_status "Creating database..."
sudo -u postgres createdb $DB_NAME 2>/dev/null || {
    print_warning "Database might already exist..."
}

# Grant privileges
print_status "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;" 2>/dev/null

# Test the connection
print_status "Testing database connection..."
if PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1;" 2>/dev/null; then
    print_status "✅ Database connection successful!"
else
    print_error "❌ Database connection failed. Trying alternative setup..."
    
    # Alternative method: Create user with different approach
    print_status "Trying alternative PostgreSQL setup..."
    
    # Create a temporary SQL file
    cat > /tmp/setup_db.sql << EOF
-- Create user if not exists
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
   ELSE
      ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
   END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF

    # Execute the SQL file
    sudo -u postgres psql -f /tmp/setup_db.sql
    
    # Clean up
    rm /tmp/setup_db.sql
    
    # Test again
    if PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1;" 2>/dev/null; then
        print_status "✅ Database connection successful after alternative setup!"
    else
        print_error "❌ Database connection still failed."
        print_status "Please check PostgreSQL configuration manually:"
        echo "  1. sudo -u postgres psql"
        echo "  2. \du (to list users)"
        echo "  3. \l (to list databases)"
        echo "  4. CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        echo "  5. CREATE DATABASE $DB_NAME;"
        echo "  6. GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
        exit 1
    fi
fi

print_status "Database setup completed successfully!"
echo ""
echo "📊 Database Information:"
echo "  - Host: localhost"
echo "  - Port: 5432"
echo "  - Database: $DB_NAME"
echo "  - User: $DB_USER"
echo "  - Password: $DB_PASSWORD"
echo ""
echo "🔧 Next steps:"
echo "  1. Run the deployment script again: ./deploy_production.sh"
echo "  2. If you still get errors, check PostgreSQL logs: sudo journalctl -u postgresql"
echo ""

print_status "Database fix script completed!" 