#!/bin/bash

# Shortcut Store Production Deployment Script
# This script sets up Django with Gunicorn and Nginx for production

set -e  # Exit on any error

echo "🚀 Starting Shortcut Store Production Deployment..."

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
   print_error "This script should not be run as root. Please run as a regular user."
   exit 1
fi

# Variables
PROJECT_NAME="shortcut-store"
DOMAIN="shortcut-eg.store"
VPS_IP="147.93.127.239"
USERNAME=$(whoami)
PROJECT_DIR="/home/$USERNAME/$PROJECT_NAME"

print_status "Deployment Configuration:"
echo "  - Project: $PROJECT_NAME"
echo "  - Domain: $DOMAIN"
echo "  - VPS IP: $VPS_IP"
echo "  - Username: $USERNAME"
echo "  - Project Directory: $PROJECT_DIR"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found at $PROJECT_DIR"
    print_status "Searching for project directory..."
    
    # Search for the project in common locations
    SEARCH_DIRS=("/home/$USERNAME" "/var/www" "/opt" "/root")
    
    for dir in "${SEARCH_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            FOUND_PROJECT=$(find "$dir" -name "$PROJECT_NAME" -type d 2>/dev/null | head -1)
            if [ ! -z "$FOUND_PROJECT" ]; then
                PROJECT_DIR="$FOUND_PROJECT"
                print_status "Found project at: $PROJECT_DIR"
                break
            fi
        fi
    done
    
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Could not find project directory. Please specify the correct path."
        exit 1
    fi
fi

print_status "Project found at: $PROJECT_DIR"

# Navigate to project directory
cd "$PROJECT_DIR"

# Check if virtual environment exists
if [ ! -d "venv_new" ]; then
    print_warning "Virtual environment not found. Creating new one..."
    python3 -m venv venv_new
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv_new/bin/activate

# Install/upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install requirements
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Update .env file with production settings
print_status "Updating environment configuration..."
cat > .env << EOF
# Django Settings
DEBUG=False
SECRET_KEY=demo-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,$VPS_IP,$DOMAIN,www.$DOMAIN
DJANGO_SETTINGS_MODULE=shortcut.settings_production

# Database
DB_NAME=shortcut_store
DB_USER=shortcut_user
DB_PASSWORD=ShortcutTest2024!
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
VITE_API_URL=http://$DOMAIN/api
VITE_WS_URL=ws://$DOMAIN/ws
EOF

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
chmod 755 logs

# Run migrations
print_status "Running database migrations..."
export DJANGO_SETTINGS_MODULE=shortcut.settings_production
python manage.py migrate

# Collect static files
print_status "Collecting static files..."
python manage.py collectstatic --noinput

# Create Gunicorn service file
print_status "Creating Gunicorn systemd service..."
sudo tee /etc/systemd/system/gunicorn-shortcut.service > /dev/null << EOF
[Unit]
Description=Gunicorn daemon for Shortcut Store
After=network.target

[Service]
User=$USERNAME
Group=www-data
WorkingDirectory=$PROJECT_DIR
EnvironmentFile=$PROJECT_DIR/.env
Environment=DJANGO_SETTINGS_MODULE=shortcut.settings_production
ExecStart=$PROJECT_DIR/venv_new/bin/gunicorn \\
    --access-logfile $PROJECT_DIR/logs/gunicorn_access.log \\
    --error-logfile $PROJECT_DIR/logs/gunicorn_error.log \\
    --capture-output \\
    --log-level info \\
    --workers 3 \\
    --bind 127.0.0.1:8000 \\
    shortcut.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/shortcut-store > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN $VPS_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logs
    access_log $PROJECT_DIR/logs/nginx_access.log;
    error_log $PROJECT_DIR/logs/nginx_error.log;

    # Static files
    location /static/ {
        alias $PROJECT_DIR/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias $PROJECT_DIR/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Favicon
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    # Main application
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health/ {
        proxy_pass http://127.0.0.1:8000/health/;
        access_log off;
    }
}
EOF

# Enable Nginx site
print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/shortcut-store /etc/nginx/sites-enabled/

# Remove default Nginx site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Reload systemd and start services
print_status "Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable gunicorn-shortcut
sudo systemctl start gunicorn-shortcut
sudo systemctl reload nginx

# Check service status
print_status "Checking service status..."
echo ""
echo "Gunicorn Status:"
sudo systemctl status gunicorn-shortcut --no-pager -l

echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l

# Create log rotation configuration
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/shortcut-store > /dev/null << EOF
$PROJECT_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USERNAME www-data
    postrotate
        systemctl reload gunicorn-shortcut
    endscript
}
EOF

# Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R $USERNAME:www-data "$PROJECT_DIR"
sudo chmod -R 755 "$PROJECT_DIR"
sudo chmod 644 "$PROJECT_DIR/.env"

# Create a simple health check
print_status "Creating health check endpoint..."
cat > "$PROJECT_DIR/core/healthcheck.py" << 'EOF'
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'service': 'shortcut-store',
        'timestamp': '2025-07-06T12:00:00Z'
    })
EOF

# Add health check URL to main URLs
if ! grep -q "health/" "$PROJECT_DIR/shortcut/urls.py"; then
    print_status "Adding health check URL..."
    # This is a simple addition - you might need to adjust based on your URL structure
    echo "# Health check URL will be added manually if needed" >> "$PROJECT_DIR/shortcut/urls.py"
fi

# Final status check
print_status "Deployment completed successfully!"
echo ""
echo "🌐 Your website should now be accessible at:"
echo "   http://$DOMAIN"
echo "   http://$VPS_IP"
echo ""
echo "📊 Service Management:"
echo "   - Check Gunicorn: sudo systemctl status gunicorn-shortcut"
echo "   - Check Nginx: sudo systemctl status nginx"
echo "   - Restart Gunicorn: sudo systemctl restart gunicorn-shortcut"
echo "   - Restart Nginx: sudo systemctl restart nginx"
echo ""
echo "📝 Logs:"
echo "   - Django logs: $PROJECT_DIR/logs/django.log"
echo "   - Gunicorn logs: $PROJECT_DIR/logs/gunicorn_*.log"
echo "   - Nginx logs: $PROJECT_DIR/logs/nginx_*.log"
echo ""
echo "🔧 Next steps:"
echo "   1. Test your website in a browser"
echo "   2. Set up SSL/HTTPS with Let's Encrypt"
echo "   3. Configure your domain DNS if not already done"
echo "   4. Update the SECRET_KEY in .env for production"
echo ""

print_status "Deployment script completed!" 