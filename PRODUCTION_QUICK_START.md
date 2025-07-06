# 🚀 Quick Production Setup for Shortcut Store

## One-Command Deployment

```bash
# Quick deployment with automated script
./deploy_production.sh -d yourdomain.com -e your-email@example.com -t docker

# Or for traditional deployment
./deploy_production.sh -d yourdomain.com -e your-email@example.com -t traditional
```

## Manual Quick Setup

### 1. Install Production Dependencies
```bash
pip install -r requirements_production.txt
```

### 2. Setup Environment
```bash
cp .env.production .env
# Edit .env with your actual values
```

### 3. Docker Deployment (Recommended)
```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d

# Setup database
docker-compose -f docker-compose.production.yml exec web python manage.py migrate
docker-compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput
docker-compose -f docker-compose.production.yml exec web python manage.py createsuperuser
```

### 4. Traditional Deployment
```bash
# Install system dependencies
sudo apt update && sudo apt install -y postgresql redis-server nginx

# Setup application
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# Start services
sudo systemctl start postgresql redis-server nginx
```

## 🔧 Key Configuration Files

### Environment Variables (`.env`)
```bash
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_PASSWORD=secure-password
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend Environment (`frontend/.env.production`)
```bash
VITE_API_BASE_URL=https://yourdomain.com
```

## 🌐 Domain Setup

1. **Point DNS to your server**
   ```
   A Record: yourdomain.com → YOUR_SERVER_IP
   A Record: www.yourdomain.com → YOUR_SERVER_IP
   ```

2. **SSL Certificates (Let's Encrypt)**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

## 🛡️ Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Set strong database passwords
- [ ] Configure firewall (UFW)
- [ ] Setup Fail2Ban
- [ ] Enable HTTPS redirect
- [ ] Configure rate limiting

## 📊 Monitoring Commands

```bash
# Check all services
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs web
docker-compose -f docker-compose.production.yml logs nginx

# Monitor resources
htop
./monitor.sh
```

## 🔄 Update Deployment

```bash
# Pull latest code
git pull

# Docker deployment
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml exec web python manage.py migrate
docker-compose -f docker-compose.production.yml exec web python manage.py collectstatic --noinput
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port already in use**
   ```bash
   sudo lsof -i :80
   sudo lsof -i :443
   ```

2. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER .
   sudo chmod +x deploy_production.sh
   ```

3. **Database connection failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   psql -h localhost -U shortcut_user -d shortcut_store
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate
   sudo certbot certificates
   
   # Renew if needed
   sudo certbot renew --force-renewal
   ```

## 📞 Support

- Check logs: `docker-compose logs` or `/var/log/`
- Monitor resources: `htop`, `free -h`, `df -h`
- Test connectivity: `curl -I https://yourdomain.com`

## 🎯 Production URLs

- **Website**: https://yourdomain.com
- **Admin Panel**: https://yourdomain.com/admin/
- **API**: https://yourdomain.com/api/
- **Health Check**: https://yourdomain.com/healthz/

---

**Your Django + React app is now production-ready with enterprise-level security, performance, and monitoring!** 🚀