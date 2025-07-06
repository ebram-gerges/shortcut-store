#!/bin/bash

# Production Deployment Script for Shortcut Store
# This script automates the production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

# Configuration
DOMAIN=""
EMAIL=""
DEPLOYMENT_TYPE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL="$2"
            shift 2
            ;;
        -t|--type)
            DEPLOYMENT_TYPE="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -d, --domain DOMAIN     Your domain name (required)"
            echo "  -e, --email EMAIL       Your email for SSL certificates (required)"
            echo "  -t, --type TYPE         Deployment type: docker or traditional (default: docker)"
            echo "  -h, --help              Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option $1"
            ;;
    esac
done

# Validate required parameters
if [[ -z "$DOMAIN" ]]; then
    error "Domain is required. Use -d or --domain option."
fi

if [[ -z "$EMAIL" ]]; then
    error "Email is required for SSL certificates. Use -e or --email option."
fi

if [[ -z "$DEPLOYMENT_TYPE" ]]; then
    DEPLOYMENT_TYPE="docker"
fi

log "Starting production deployment for $DOMAIN"
log "Deployment type: $DEPLOYMENT_TYPE"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# System requirements check
check_requirements() {
    log "Checking system requirements..."
    
    # Check OS
    if [[ ! -f /etc/os-release ]]; then
        error "Cannot determine OS version"
    fi
    
    . /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        warn "This script is optimized for Ubuntu. Your OS: $ID"
    fi
    
    # Check resources
    total_ram=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [[ $total_ram -lt 2048 ]]; then
        warn "Low RAM detected: ${total_ram}MB. Recommended: 4GB+"
    fi
    
    disk_space=$(df -BG . | awk 'NR==2{printf "%.0f", $4}' | sed 's/G//')
    if [[ $disk_space -lt 20 ]]; then
        warn "Low disk space: ${disk_space}GB available. Recommended: 50GB+"
    fi
    
    log "System requirements check completed"
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install basic tools
    sudo apt install -y curl wget git unzip htop iotop nethogs ufw fail2ban
    
    if [[ "$DEPLOYMENT_TYPE" == "docker" ]]; then
        # Install Docker
        if ! command_exists docker; then
            log "Installing Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
        fi
        
        # Install Docker Compose
        if ! command_exists docker-compose; then
            log "Installing Docker Compose..."
            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
        fi
    else
        # Install traditional deployment dependencies
        sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib redis-server nginx
    fi
    
    # Install Certbot for SSL
    sudo apt install -y certbot python3-certbot-nginx
    
    log "Dependencies installed successfully"
}

# Configure firewall
setup_firewall() {
    log "Configuring firewall..."
    
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    log "Firewall configured"
}

# Setup Fail2Ban
setup_fail2ban() {
    log "Configuring Fail2Ban..."
    
    sudo tee /etc/fail2ban/jail.local > /dev/null << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 7200
EOF
    
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    
    log "Fail2Ban configured"
}

# Generate SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Stop nginx if running
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Generate certificates
    sudo certbot certonly --standalone --agree-tos --no-eff-email --email "$EMAIL" -d "$DOMAIN" -d "www.$DOMAIN"
    
    # Create SSL directory for application
    mkdir -p ./ssl
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ./ssl/
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ./ssl/
    sudo cp "/etc/letsencrypt/live/$DOMAIN/chain.pem" ./ssl/
    sudo chown -R $USER:$USER ./ssl
    
    # Setup auto-renewal
    echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'" | sudo crontab -
    
    log "SSL certificates configured"
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables..."
    
    if [[ ! -f .env ]]; then
        cp .env.production .env
        
        # Generate secure keys
        SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
        DB_PASSWORD=$(openssl rand -base64 32)
        ADMIN_PASSWORD=$(openssl rand -base64 16)
        
        # Update environment file
        sed -i "s/yourdomain.com/$DOMAIN/g" .env
        sed -i "s/your-very-strong-secret-key-here-change-this-in-production/$SECRET_KEY/g" .env
        sed -i "s/your-secure-postgresql-password/$DB_PASSWORD/g" .env
        sed -i "s/your-secure-admin-password/$ADMIN_PASSWORD/g" .env
        
        log "Environment file created. Please update .env with your specific values:"
        echo "  - Email settings (EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)"
        echo "  - OAuth settings (if using Google OAuth)"
        echo "  - Any other service-specific settings"
        
        read -p "Press Enter to continue after updating .env file..."
    else
        log "Environment file already exists"
    fi
}

# Docker deployment
deploy_docker() {
    log "Deploying with Docker..."
    
    # Update nginx configuration
    sed -i "s/yourdomain.com/$DOMAIN/g" nginx/production.conf
    
    # Build and start services
    docker-compose -f docker-compose.production.yml build
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to start
    sleep 30
    
    # Run initial setup
    docker-compose -f docker-compose.production.yml exec -T web python manage.py migrate
    docker-compose -f docker-compose.production.yml exec -T web python manage.py collectstatic --noinput
    
    # Create superuser
    log "Creating superuser..."
    docker-compose -f docker-compose.production.yml exec -T web python manage.py shell << EOF
from django.contrib.auth import get_user_model
import os
User = get_user_model()
if not User.objects.filter(email=os.getenv('ADMIN_EMAIL', 'admin@$DOMAIN')).exists():
    User.objects.create_superuser(
        email=os.getenv('ADMIN_EMAIL', 'admin@$DOMAIN'),
        password=os.getenv('ADMIN_PASSWORD', 'admin123')
    )
    print('Superuser created')
else:
    print('Superuser already exists')
EOF
    
    log "Docker deployment completed"
}

# Traditional deployment
deploy_traditional() {
    log "Deploying traditionally..."
    
    # Setup application directory
    sudo mkdir -p /var/www/shortcut-store
    sudo chown $USER:$USER /var/www/shortcut-store
    cp -r . /var/www/shortcut-store/
    cd /var/www/shortcut-store
    
    # Setup virtual environment
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements_production.txt
    
    # Setup database
    sudo -u postgres createdb shortcut_store || true
    sudo -u postgres createuser shortcut_user || true
    sudo -u postgres psql -c "ALTER USER shortcut_user WITH PASSWORD '$(grep DB_PASSWORD .env | cut -d'=' -f2)';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE shortcut_store TO shortcut_user;"
    
    # Build frontend
    cd frontend
    npm install
    npm run build
    cd ..
    
    # Django setup
    python manage.py migrate
    python manage.py collectstatic --noinput
    
    # Setup services
    sudo cp systemd/*.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable gunicorn celery celery-beat
    sudo systemctl start gunicorn celery celery-beat
    
    # Setup nginx
    sed -i "s/yourdomain.com/$DOMAIN/g" nginx/production.conf
    sudo cp nginx/production.conf /etc/nginx/sites-available/shortcut-store
    sudo ln -sf /etc/nginx/sites-available/shortcut-store /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    log "Traditional deployment completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    tee monitor.sh > /dev/null << 'EOF'
#!/bin/bash
echo "=== System Resources ==="
free -h
df -h

echo "=== Service Status ==="
if command -v docker-compose >/dev/null 2>&1; then
    docker-compose -f docker-compose.production.yml ps
else
    sudo systemctl status gunicorn nginx postgresql redis-server
fi

echo "=== Recent Logs ==="
if [[ -f /var/log/nginx/error.log ]]; then
    sudo tail -10 /var/log/nginx/error.log
fi
EOF
    
    chmod +x monitor.sh
    
    # Setup log rotation
    sudo tee /etc/logrotate.d/shortcut-store > /dev/null << 'EOF'
/var/www/shortcut-store/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
EOF
    
    log "Monitoring setup completed"
}

# Setup backups
setup_backups() {
    log "Setting up automated backups..."
    
    # Create backup directory
    sudo mkdir -p /backups/{database,application}
    sudo chown $USER:$USER /backups
    
    # Database backup script
    sudo tee /usr/local/bin/backup-db.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)

if command -v docker-compose >/dev/null 2>&1; then
    docker-compose -f /opt/shortcut-store/docker-compose.production.yml exec -T db pg_dump -U shortcut_user shortcut_store > $BACKUP_DIR/db_$DATE.sql
else
    sudo -u postgres pg_dump shortcut_store > $BACKUP_DIR/db_$DATE.sql
fi

gzip $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
echo "Database backup completed: db_$DATE.sql.gz"
EOF
    
    sudo chmod +x /usr/local/bin/backup-db.sh
    
    # Schedule backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -
    
    log "Backup system configured"
}

# Health check
health_check() {
    log "Running health checks..."
    
    # Wait for services to be ready
    sleep 10
    
    # Check if application is responding
    if curl -f -s "http://localhost" >/dev/null; then
        log "✅ Application is responding on HTTP"
    else
        warn "❌ Application not responding on HTTP"
    fi
    
    if curl -f -s -k "https://localhost" >/dev/null; then
        log "✅ Application is responding on HTTPS"
    else
        warn "❌ Application not responding on HTTPS"
    fi
    
    # Check database connection
    if [[ "$DEPLOYMENT_TYPE" == "docker" ]]; then
        if docker-compose -f docker-compose.production.yml exec -T web python manage.py check --database default >/dev/null 2>&1; then
            log "✅ Database connection successful"
        else
            warn "❌ Database connection failed"
        fi
    fi
    
    log "Health check completed"
}

# Main deployment function
main() {
    log "🚀 Starting Shortcut Store Production Deployment"
    log "Domain: $DOMAIN"
    log "Email: $EMAIL"
    log "Type: $DEPLOYMENT_TYPE"
    
    check_requirements
    install_dependencies
    setup_firewall
    setup_fail2ban
    setup_ssl
    setup_environment
    
    if [[ "$DEPLOYMENT_TYPE" == "docker" ]]; then
        deploy_docker
    else
        deploy_traditional
    fi
    
    setup_monitoring
    setup_backups
    health_check
    
    log "🎉 Deployment completed successfully!"
    echo ""
    echo "Your Shortcut Store is now running at:"
    echo "  🌐 Website: https://$DOMAIN"
    echo "  🔧 Admin: https://$DOMAIN/admin/"
    echo ""
    echo "Next steps:"
    echo "  1. Update DNS to point $DOMAIN to this server"
    echo "  2. Test the application thoroughly"
    echo "  3. Monitor logs and performance"
    echo "  4. Set up additional monitoring if needed"
    echo ""
    echo "Admin credentials are in your .env file."
    echo "Remember to save your .env file securely!"
}

# Run main function
main "$@"