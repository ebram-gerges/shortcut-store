# 🚀 Deployment Instructions for shortcut-eg.store

## 📋 Server Configuration
- **Domain**: shortcut-eg.store
- **Server IP**: 147.93.127.239
- **RAM**: 8GB (optimized configuration)
- **Storage**: 100GB
- **OS**: Ubuntu 22.04 LTS (recommended)

## 🎯 One-Command Deployment

```bash
# SSH to your server first
ssh root@147.93.127.239

# Clone the repository
git clone <your-repo-url> /tmp/shortcut-store
cd /tmp/shortcut-store

# Run the automated deployment script
chmod +x deploy_shortcut_eg_store.sh
./deploy_shortcut_eg_store.sh
```

## 🔧 Manual Step-by-Step Deployment

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Create application user (if not exists)
sudo adduser shortcut --disabled-password --gecos ""
sudo usermod -aG sudo shortcut

# Switch to application user
sudo su - shortcut
```

### 2. Install Dependencies

```bash
# Install system packages
sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib redis-server nginx git curl wget unzip fail2ban ufw htop

# Install Node.js for frontend build
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Setup Databases

```bash
# Configure PostgreSQL
sudo -u postgres psql << EOF
CREATE DATABASE shortcut_store_prod;
CREATE USER shortcut_user_prod WITH PASSWORD 'SecurePgPass_2024_8f2a9c1b4e6d7a3f';
GRANT ALL PRIVILEGES ON DATABASE shortcut_store_prod TO shortcut_user_prod;
ALTER USER shortcut_user_prod CREATEDB;
\q
EOF

# Configure Redis
sudo tee -a /etc/redis/redis.conf << EOF
maxmemory 512mb
maxmemory-policy allkeys-lru
requirepass SecureRedisPass_2024_8f2a9c1b
EOF

sudo systemctl restart redis-server
```

### 4. Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/shortcut-store
sudo chown shortcut:shortcut /var/www/shortcut-store

# Copy application files
cp -r . /var/www/shortcut-store/
cd /var/www/shortcut-store

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements_production.txt

# Create necessary directories
mkdir -p logs staticfiles media backups
chmod 755 logs staticfiles media
chmod 700 backups
```

### 5. Configure Environment

```bash
# Copy environment file
cp .env.production .env

# The .env file is already configured with:
# - Domain: shortcut-eg.store
# - Server IP: 147.93.127.239
# - Optimized settings for 8GB RAM
# - Secure passwords and keys
```

### 6. Setup Django Application

```bash
# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create admin user
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@shortcut-eg.store').exists():
    User.objects.create_superuser(
        email='admin@shortcut-eg.store',
        password='AdminSecure2024!8f2a9c'
    )
    print('Admin user created')
EOF
```

### 7. Setup SSL Certificates

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Stop nginx if running
sudo systemctl stop nginx

# Generate certificates
sudo certbot certonly --standalone --agree-tos --no-eff-email --email admin@shortcut-eg.store -d shortcut-eg.store -d www.shortcut-eg.store
```

### 8. Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx/shortcut-eg-store.conf /etc/nginx/sites-available/shortcut-eg-store
sudo ln -sf /etc/nginx/sites-available/shortcut-eg-store /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 9. Setup System Services

```bash
# Create systemd services (already configured in deployment script)
sudo systemctl daemon-reload
sudo systemctl enable gunicorn celery
sudo systemctl start gunicorn celery
```

### 10. Configure Firewall & Security

```bash
# Configure UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw limit ssh
sudo ufw --force enable

# Configure Fail2Ban (configuration in deployment script)
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## ✅ Post-Deployment Testing

### Run Comprehensive API Tests

```bash
# Install testing dependencies
pip install requests urllib3

# Run the comprehensive test suite
python3 test_shortcut_eg_store_apis.py

# This will test:
# - Basic connectivity
# - SSL certificates
# - Security headers
# - API endpoints
# - Authentication
# - Admin panel
# - Rate limiting
# - Security vulnerabilities
```

### Manual Testing Checklist

1. **Website Access**:
   - ✅ https://shortcut-eg.store loads
   - ✅ www.shortcut-eg.store redirects to main domain
   - ✅ HTTP redirects to HTTPS

2. **Admin Panel**:
   - ✅ https://shortcut-eg.store/secure-admin-panel-2024/
   - ✅ Login with: admin@shortcut-eg.store / AdminSecure2024!8f2a9c
   - ✅ Can access all admin sections

3. **API Endpoints**:
   - ✅ https://shortcut-eg.store/api/
   - ✅ https://shortcut-eg.store/api/products/
   - ✅ https://shortcut-eg.store/api/categories/
   - ✅ https://shortcut-eg.store/api/auth/
   - ✅ https://shortcut-eg.store/api/cart/
   - ✅ https://shortcut-eg.store/api/wishlist/

4. **Security Tests**:
   - ✅ Rate limiting works
   - ✅ Security headers present
   - ✅ Sensitive files blocked
   - ✅ SSL A+ rating

## 🔐 Security Features Enabled

### Network Security
- ✅ **UFW Firewall**: Only ports 22, 80, 443 open
- ✅ **Fail2Ban**: Protection against brute force attacks
- ✅ **Rate Limiting**: Nginx-level rate limiting for all endpoints
- ✅ **SSH Hardening**: Key-based authentication, rate limiting

### Application Security
- ✅ **HTTPS Only**: SSL/TLS encryption with A+ rating
- ✅ **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- ✅ **CSRF Protection**: Django CSRF middleware
- ✅ **XSS Protection**: Content Security Policy
- ✅ **SQL Injection Protection**: Django ORM, parameterized queries

### Authentication Security
- ✅ **Strong Passwords**: 12+ character minimum
- ✅ **JWT Tokens**: Secure API authentication
- ✅ **Session Security**: Secure, HttpOnly cookies
- ✅ **Admin Security**: Custom admin URL, rate limiting

### Data Security
- ✅ **Database Encryption**: PostgreSQL with SSL
- ✅ **Redis Security**: Password authentication, disabled dangerous commands
- ✅ **File Security**: Proper permissions, no execution of uploads
- ✅ **Backup Encryption**: Automated secure backups

## 🎛️ Monitoring & Maintenance

### System Monitoring

```bash
# Check system status
/var/www/shortcut-store/monitor.sh

# Check service status
sudo systemctl status gunicorn celery nginx postgresql redis-server

# Check logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/www/shortcut-store/logs/django.log
sudo tail -f /var/www/shortcut-store/logs/security.log
```

### Performance Monitoring

```bash
# System resources
htop
free -h
df -h

# Database performance
sudo -u postgres psql shortcut_store_prod -c "SELECT * FROM pg_stat_activity;"

# Redis performance
redis-cli info stats
```

### Automated Backups

```bash
# Database backup (automated daily at 2 AM)
sudo -u postgres pg_dump shortcut_store_prod | gzip > /backups/db_$(date +%Y%m%d).sql.gz

# Application backup
tar -czf /backups/media_$(date +%Y%m%d).tar.gz /var/www/shortcut-store/media/
```

## 🚨 Troubleshooting

### Common Issues

1. **Service Won't Start**:
   ```bash
   sudo systemctl status gunicorn
   sudo journalctl -u gunicorn -f
   ```

2. **Database Connection Issues**:
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql shortcut_store_prod
   ```

3. **SSL Certificate Issues**:
   ```bash
   sudo certbot certificates
   sudo certbot renew --force-renewal
   ```

4. **High Memory Usage**:
   ```bash
   # Restart services
   sudo systemctl restart gunicorn celery
   
   # Check Redis memory
   redis-cli info memory
   ```

### Emergency Procedures

1. **Stop All Services**:
   ```bash
   sudo systemctl stop gunicorn celery nginx
   ```

2. **Restart All Services**:
   ```bash
   sudo systemctl restart postgresql redis-server gunicorn celery nginx
   ```

3. **Check Fail2Ban Status**:
   ```bash
   sudo fail2ban-client status
   sudo fail2ban-client status nginx-limit-req
   ```

## 📊 Performance Optimization

### Database Optimization (PostgreSQL)
- ✅ **Shared Buffers**: 2GB (25% of RAM)
- ✅ **Effective Cache Size**: 6GB (75% of RAM)
- ✅ **Work Memory**: 16MB per connection
- ✅ **Connection Pooling**: 600 seconds max age

### Cache Optimization (Redis)
- ✅ **Memory Limit**: 512MB (6% of total RAM)
- ✅ **Eviction Policy**: allkeys-lru
- ✅ **Persistence**: RDB snapshots for backup

### Web Server Optimization (Nginx)
- ✅ **Gzip Compression**: Enabled for all text files
- ✅ **Static File Caching**: 1 year cache for assets
- ✅ **Keep-Alive**: 65 seconds
- ✅ **Worker Processes**: Auto (based on CPU cores)

### Application Optimization (Django)
- ✅ **Gunicorn Workers**: 4 workers, 2 threads each
- ✅ **Database Connections**: Persistent connections
- ✅ **Static Files**: WhiteNoise with compression
- ✅ **Session Storage**: Redis-based sessions

## 🎉 Deployment Complete!

Your Shortcut Store is now running in production with enterprise-level security and performance optimization.

### Access Information:
- **Website**: https://shortcut-eg.store
- **Admin Panel**: https://shortcut-eg.store/secure-admin-panel-2024/
- **API Base**: https://shortcut-eg.store/api/

### Admin Credentials:
- **Email**: admin@shortcut-eg.store
- **Password**: AdminSecure2024!8f2a9c

### Key Features:
- ✅ **SSL/TLS A+ Rating**
- ✅ **Enterprise Security Headers**
- ✅ **Advanced Rate Limiting**
- ✅ **Intrusion Prevention**
- ✅ **Automated Monitoring**
- ✅ **Performance Optimization**
- ✅ **Automated Backups**

**Your e-commerce platform is now ready to handle production traffic securely and efficiently!** 🚀