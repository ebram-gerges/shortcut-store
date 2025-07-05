# Shortcut Store - Client Demo

## 🚀 Quick Start

This demo showcases a complete e-commerce platform with PostgreSQL, Redis caching, Celery background tasks, and a modern React frontend.

### Prerequisites
- Linux system with sudo access
- Node.js 18+ and npm
- Python 3.8+

### One-Command Setup

```bash
# 1. Make scripts executable
chmod +x run_demo.sh stop_demo.sh restart_demo.sh setup_postgresql.sh

# 2. Setup PostgreSQL (if not already installed)
./setup_postgresql.sh

# 3. Install and start Redis
sudo apt install redis-server
sudo systemctl start redis

# 4. Run the complete demo
./run_demo.sh
```

## 📱 Demo Access

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main e-commerce interface |
| **Backend API** | http://localhost:8000/api | REST API endpoints |
| **Admin Panel** | http://localhost:8000/admin | Django admin interface |
| **Debug Toolbar** | http://localhost:8000/debug/ | Performance monitoring |

## 🔑 Demo Credentials

- **Admin:** `admin` / `admin123`
- **Test User:** `demo_user` / `demo123`

## 🎯 Features to Showcase

### Customer Features
- User registration and authentication
- Product browsing and search
- Shopping cart and wishlist
- Checkout process
- Order tracking

### Admin Features
- Product management
- Order processing
- User management
- Analytics dashboard

### Technical Features
- PostgreSQL database
- Redis caching
- Celery background tasks
- JWT authentication
- RESTful API
- Performance monitoring

## 🛑 Stop Demo

```bash
./stop_demo.sh
```

## 🔄 Restart Demo

```bash
./restart_demo.sh
```

## 📖 Detailed Guide

See [CLIENT_DEMO_GUIDE.md](CLIENT_DEMO_GUIDE.md) for a comprehensive demo guide with step-by-step instructions.

## 🐛 Troubleshooting

### Common Issues

**PostgreSQL not running:**
```bash
sudo systemctl start postgresql
```

**Redis not running:**
```bash
sudo systemctl start redis
```

**Port conflicts:**
```bash
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :5173
```

**Permission issues:**
```bash
chmod +x *.sh
```

## 📞 Support

For technical support during the demo:
- Check the console output for errors
- Review the logs in the terminal
- Restart services if needed with `./restart_demo.sh`

---

**Note:** This is a demonstration environment. For production deployment, additional security, monitoring, and scaling considerations should be implemented. 