# 🚀 Production Deployment Guide for Shortcut Store

This comprehensive guide covers deploying your Django + React application to production with security, performance, and scalability best practices.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Application Deployment](#application-deployment)
5. [SSL/HTTPS Setup](#ssl-https-setup)
6. [Monitoring & Logging](#monitoring--logging)
7. [Performance Optimization](#performance-optimization)
8. [Security Hardening](#security-hardening)
9. [Backup Strategy](#backup-strategy)
10. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Server**: 2+ vCPU, 4GB+ RAM, 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Domain**: Registered domain with DNS pointing to your server
- **SSL**: Let's Encrypt or commercial SSL certificate

### Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install other tools
sudo apt install -y git curl wget unzip certbot nginx
```

## 🌍 Environment Setup

### 1. Clone and Setup Repository
```bash
# Clone your repository
git clone https://github.com/yourusername/shortcut-store.git
cd shortcut-store

# Create production environment file
cp .env.production .env
```

### 2. Configure Environment Variables
Edit `.env` with your production values:

```bash
# Critical: Change these values
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_PASSWORD=$(openssl rand -base64 32)
ADMIN_PASSWORD=$(openssl rand -base64 16)

# Email configuration (Gmail example)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password

# OAuth (optional)
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
```

### 3. Generate SSL Certificates
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates (stop nginx first if running)
sudo systemctl stop nginx
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Create SSL directory for Docker
sudo mkdir -p ./ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/chain.pem ./ssl/
sudo chown -R $USER:$USER ./ssl
```

## 💾 Database Configuration

### 1. PostgreSQL Setup (if not using Docker)
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createdb shortcut_store
sudo -u postgres createuser shortcut_user
sudo -u postgres psql -c "ALTER USER shortcut_user WITH PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE shortcut_store TO shortcut_user;"
sudo -u postgres psql -c "ALTER USER shortcut_user CREATEDB;"
```

### 2. Redis Setup (if not using Docker)
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

# Start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

## 🚀 Application Deployment

### Option 1: Docker Deployment (Recommended)

#### 1. Build and Start Services
```bash
# Build production images
docker-compose -f docker-compose.production.yml build

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Run initial setup
docker-compose -f docker-compose.production.yml exec web python manage.py migrate
docker-compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput
docker-compose -f docker-compose.production.yml exec web python manage.py createsuperuser
```

#### 2. Health Check
```bash
# Check all services
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs web
docker-compose -f docker-compose.production.yml logs nginx
```

### Option 2: Traditional Deployment

#### 1. Application Setup
```bash
# Create application directory
sudo mkdir -p /var/www/shortcut-store
sudo chown $USER:$USER /var/www/shortcut-store

# Copy application
cp -r . /var/www/shortcut-store/
cd /var/www/shortcut-store

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements_production.txt
```

#### 2. Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

#### 3. Django Setup
```bash
# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser
```

#### 4. Configure Services
```bash
# Copy systemd services
sudo cp systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload

# Start services
sudo systemctl enable gunicorn celery celery-beat
sudo systemctl start gunicorn celery celery-beat
```

## 🔒 SSL/HTTPS Setup

### 1. Nginx Configuration
```bash
# Update nginx configuration with your domain
sed -i 's/yourdomain.com/your-actual-domain.com/g' nginx/production.conf

# Copy nginx configuration
sudo cp nginx/production.conf /etc/nginx/sites-available/shortcut-store
sudo ln -sf /etc/nginx/sites-available/shortcut-store /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. SSL Renewal Setup
```bash
# Create renewal hook
sudo tee /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
if [ -d "/path/to/your/app/ssl" ]; then
    cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/your/app/ssl/
    cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/your/app/ssl/
    cp /etc/letsencrypt/live/yourdomain.com/chain.pem /path/to/your/app/ssl/
    docker-compose -f /path/to/your/app/docker-compose.production.yml restart nginx
fi
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

# Test renewal
sudo certbot renew --dry-run
```

## 📊 Monitoring & Logging

### 1. Application Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Create monitoring script
tee monitor.sh << 'EOF'
#!/bin/bash
echo "=== System Resources ==="
htop -n 1 | head -20

echo "=== Docker Services ==="
docker-compose -f docker-compose.production.yml ps

echo "=== Application Logs ==="
docker-compose -f docker-compose.production.yml logs --tail=20 web

echo "=== Nginx Logs ==="
sudo tail -20 /var/log/nginx/access.log
sudo tail -20 /var/log/nginx/error.log
EOF

chmod +x monitor.sh
```

### 2. Log Rotation
```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/shortcut-store << 'EOF'
/var/www/shortcut-store/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        sudo systemctl reload gunicorn
    endscript
}
EOF
```

### 3. Setup Alerts (Optional)
```bash
# Install monitoring (example with Prometheus + Grafana)
# This is optional but recommended for production

# Add monitoring stack to docker-compose
# See monitoring/docker-compose.monitoring.yml for full setup
```

## ⚡ Performance Optimization

### 1. Database Optimization
```sql
-- Connect to PostgreSQL
sudo -u postgres psql shortcut_store

-- Optimize settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET random_page_cost = 1.1;

-- Reload configuration
SELECT pg_reload_conf();

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_product_category ON products_product(category_id);
CREATE INDEX CONCURRENTLY idx_product_price ON products_product(price);
CREATE INDEX CONCURRENTLY idx_order_user ON orders_order(user_id);
CREATE INDEX CONCURRENTLY idx_order_created ON orders_order(created_at);
```

### 2. Redis Optimization
```bash
# Update Redis configuration
sudo tee -a /etc/redis/redis.conf << 'EOF'
# Memory optimization
maxmemory 512mb
maxmemory-policy allkeys-lru

# Performance tuning
tcp-keepalive 60
timeout 300

# Persistence optimization
save 900 1
save 300 10
save 60 10000
EOF

sudo systemctl restart redis-server
```

### 3. Nginx Optimization
```bash
# Update nginx main configuration
sudo tee /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Include mime types and site configs
    include /etc/nginx/mime.types;
    include /etc/nginx/sites-enabled/*;
}
EOF

sudo systemctl restart nginx
```

## 🛡️ Security Hardening

### 1. Firewall Configuration
```bash
# Install and configure UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable
```

### 2. Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure Fail2Ban
sudo tee /etc/fail2ban/jail.local << 'EOF'
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
```

### 3. System Hardening
```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install security updates automatically
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 💾 Backup Strategy

### 1. Database Backup
```bash
# Create backup script
sudo tee /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# PostgreSQL backup
sudo -u postgres pg_dump shortcut_store > $BACKUP_DIR/db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_$DATE.sql.gz"
EOF

sudo chmod +x /usr/local/bin/backup-db.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -
```

### 2. Application Backup
```bash
# Create application backup script
sudo tee /usr/local/bin/backup-app.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/shortcut-store/media/

# Backup static files
tar -czf $BACKUP_DIR/static_$DATE.tar.gz /var/www/shortcut-store/staticfiles/

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Application backup completed: $DATE"
EOF

sudo chmod +x /usr/local/bin/backup-app.sh

# Schedule weekly backups
(crontab -l 2>/dev/null; echo "0 3 * * 0 /usr/local/bin/backup-app.sh") | crontab -
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
```bash
# Check Docker services
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml logs web

# Check traditional deployment
sudo systemctl status gunicorn
sudo journalctl -u gunicorn -f
```

#### 2. Database Connection Issues
```bash
# Test database connection
docker-compose -f docker-compose.production.yml exec web python manage.py dbshell

# Check PostgreSQL status
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Renew certificates
sudo certbot renew --force-renewal
```

#### 4. Performance Issues
```bash
# Monitor resources
htop
iotop
nethogs

# Check slow queries
sudo -u postgres psql shortcut_store -c "SELECT * FROM pg_stat_activity WHERE state != 'idle';"

# Check Redis performance
redis-cli info stats
```

### 5. Deploy Updates
```bash
# For Docker deployment
git pull
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml exec web python manage.py migrate
docker-compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput

# For traditional deployment
git pull
source venv/bin/activate
pip install -r requirements_production.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

## 📞 Support Checklist

Before seeking help, verify:

1. ✅ All services are running
2. ✅ Environment variables are correctly set
3. ✅ Database connections are working
4. ✅ SSL certificates are valid
5. ✅ Firewall rules are correct
6. ✅ Logs show no critical errors
7. ✅ Disk space is sufficient
8. ✅ DNS is pointing to correct server

## 🎉 Success!

Your Shortcut Store is now running in production with:

- ✅ **Security**: HTTPS, rate limiting, security headers
- ✅ **Performance**: Caching, compression, optimized databases
- ✅ **Monitoring**: Comprehensive logging and health checks
- ✅ **Scalability**: Docker containers, load balancing ready
- ✅ **Backup**: Automated database and file backups
- ✅ **Maintenance**: Update scripts and monitoring tools

Access your application at: `https://yourdomain.com`
Admin panel: `https://yourdomain.com/admin/`

## 🚀 Next Steps

1. Set up monitoring dashboards (Grafana + Prometheus)
2. Configure CDN for static files (CloudFlare, AWS CloudFront)
3. Implement automated testing and CI/CD
4. Set up staging environment
5. Configure application performance monitoring (APM)
6. Plan for high availability and load balancing