# Production Deployment Guide for Shortcut Store

This guide covers the complete production deployment of the Shortcut Store Django application on a 2 vCPU, 4GB RAM VPS running Ubuntu 22.04.

## 🚀 Quick Start

1. **Clone the repository and run the setup script:**
   ```bash
   git clone <your-repo>
   cd shortcut-store
   chmod +x deploy/production-setup.sh
   ./deploy/production-setup.sh
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   nano .env  # Edit with your actual values
   ```

3. **Start services:**
   ```bash
   sudo systemctl start gunicorn celery celery-beat nginx
   ```

## 📋 Prerequisites

- Ubuntu 22.04 LTS
- 2 vCPU, 4GB RAM minimum
- Domain name pointing to your server
- SSH access with sudo privileges

## 🔧 Manual Installation Steps

### 1. System Updates
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Dependencies
```bash
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib redis-server nginx git curl
```

### 3. PostgreSQL Setup
```bash
sudo -u postgres psql
CREATE DATABASE shortcut_store;
CREATE USER shortcut_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE shortcut_store TO shortcut_user;
ALTER USER shortcut_user CREATEDB;
\q
```

### 4. Redis Setup
```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 5. Application Setup
```bash
# Create app directory
sudo mkdir -p /var/www/shortcutstore
sudo chown $USER:$USER /var/www/shortcutstore

# Copy application
cp -r . /var/www/shortcutstore/
cd /var/www/shortcutstore

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 6. Environment Configuration
```bash
cp env.example .env
# Edit .env with your actual values
```

### 7. Database Migration
```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

### 8. Service Configuration

#### Copy systemd service files:
```bash
sudo cp systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
```

#### Copy Nginx configuration:
```bash
sudo cp nginx/shortcut-store.conf /etc/nginx/sites-available/shortcut-store
sudo ln -sf /etc/nginx/sites-available/shortcut-store /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

#### Copy logrotate configuration:
```bash
sudo cp logrotate/django.conf /etc/logrotate.d/django
```

### 9. Start Services
```bash
sudo systemctl enable gunicorn celery celery-beat nginx
sudo systemctl start gunicorn celery celery-beat nginx
```

## 🔒 Security Configuration

### 1. Firewall Setup
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. PostgreSQL Security
```bash
# Edit postgresql.conf with optimized settings
sudo cp postgresql/postgresql.conf /etc/postgresql/*/main/postgresql.conf
sudo systemctl restart postgresql
```

## 📊 Monitoring & Performance

### 1. System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor system resources
htop
iotop
nethogs
```

### 2. Database Monitoring
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Check slow queries
SELECT * FROM pg_stat_activity WHERE state != 'idle';

# Check table sizes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats WHERE schemaname = 'public';
```

### 3. Application Monitoring
```bash
# Check service status
sudo systemctl status gunicorn
sudo systemctl status celery
sudo systemctl status nginx

# Check logs
sudo journalctl -u gunicorn -f
sudo journalctl -u celery -f
sudo tail -f /var/log/nginx/access.log
```

### 4. Performance Tuning

#### Gunicorn Optimization:
- Workers: 3 (for 2 vCPU)
- Threads: 2 per worker
- Preload: Enabled
- Max requests: 1000 per worker

#### PostgreSQL Optimization:
- shared_buffers: 512MB
- work_mem: 16MB
- effective_cache_size: 2GB
- max_connections: 50

#### Redis Optimization:
- maxmemory: 256MB
- maxmemory-policy: allkeys-lru

## 🔄 Maintenance

### 1. Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update application
cd /var/www/shortcutstore
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

### 2. Database Maintenance
```bash
# Connect to PostgreSQL
sudo -u postgres psql shortcut_store

# Analyze tables
ANALYZE;

# Vacuum tables
VACUUM ANALYZE;
```

### 3. Log Rotation
```bash
# Manual log rotation
sudo logrotate -f /etc/logrotate.d/django

# Check log sizes
du -sh /var/log/gunicorn/*
du -sh /var/log/celery/*
```

## 🚨 Troubleshooting

### Common Issues:

1. **Service won't start:**
   ```bash
   sudo systemctl status <service-name>
   sudo journalctl -u <service-name> -f
   ```

2. **Database connection issues:**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "SELECT version();"
   ```

3. **Redis connection issues:**
   ```bash
   sudo systemctl status redis-server
   redis-cli ping
   ```

4. **Nginx issues:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

5. **Permission issues:**
   ```bash
   sudo chown -R www-data:www-data /var/www/shortcutstore
   sudo chmod -R 755 /var/www/shortcutstore
   ```

## 📈 Performance Optimization

### 1. Query Optimization
- Use `select_related()` and `prefetch_related()` in views
- Add database indexes for frequently filtered fields
- Use `only()` and `defer()` for large models
- Use `exists()` instead of `count()` for existence checks

### 2. Caching Strategy
- Cache frequently accessed data with Redis
- Use Django's cache framework
- Cache template fragments
- Cache API responses

### 3. Static Files
- Serve static files via Nginx
- Enable gzip compression
- Set proper cache headers
- Use CDN for large files

## 🔧 Configuration Files

### Environment Variables (.env)
```bash
DJANGO_SETTINGS_MODULE=shortcut.settings_production
SECRET_KEY=your-very-strong-secret-key
DB_NAME=shortcut_store
DB_USER=shortcut_user
DB_PASSWORD=your_secure_password
REDIS_URL=redis://127.0.0.1:6379/0
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### Nginx Configuration
See `nginx/shortcut-store.conf`

### PostgreSQL Configuration
See `postgresql/postgresql.conf`

### Systemd Services
See `systemd/` directory

## 📞 Support

For issues and questions:
1. Check service logs
2. Review system resources
3. Verify configuration files
4. Test database connectivity
5. Check firewall settings

## 🔄 Backup Strategy

### 1. Database Backup
```bash
# Create backup script
sudo -u postgres pg_dump shortcut_store > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup (add to crontab)
0 2 * * * sudo -u postgres pg_dump shortcut_store > /backups/db_$(date +\%Y\%m\%d).sql
```

### 2. Application Backup
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/shortcutstore/

# Backup media files
tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/shortcutstore/media/
```

# LAN/Network Access for Frontend

To make the frontend use your backend from any device on your network:

1. Edit `frontend/env.production` (or your `.env` file):

   - Set `VITE_API_BASE_URL` to your machine's local IP, e.g.:
     
     ```
     VITE_API_BASE_URL=http://192.168.1.4:8000
     ```

2. Restart the frontend dev server after changing the `.env` file.

3. Make sure both backend and frontend are running with `host: 0.0.0.0` (already configured).

4. Access the frontend from any device on your LAN using `http://<your-ip>:5173`.

---

**Your Django application is now production-ready with optimized performance, security, and monitoring!** 