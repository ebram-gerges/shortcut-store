# Shortcut Store - Client Demo Guide

## 🚀 Quick Start

### Prerequisites
- Linux system with sudo access
- Node.js 18+ and npm
- Python 3.8+

### One-Command Setup
```bash
# Make scripts executable
chmod +x run_demo.sh stop_demo.sh restart_demo.sh setup_postgresql.sh

# Setup PostgreSQL (if not already installed)
./setup_postgresql.sh

# Install and start Redis
sudo apt install redis-server
sudo systemctl start redis

# Run the complete demo
./run_demo.sh
```

## 📱 Demo Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main e-commerce interface |
| **Backend API** | http://localhost:8000/api | REST API endpoints |
| **Admin Panel** | http://localhost:8000/admin | Django admin interface |
| **Debug Toolbar** | http://localhost:8000/debug/ | Performance monitoring |

## 🔑 Demo Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Access:** Full admin privileges

### Test User Account
- **Username:** `demo_user`
- **Password:** `demo123`
- **Access:** Regular customer account

## 🎯 Demo Features to Showcase

### 1. User Authentication & Registration
**Location:** http://localhost:5173/login

**Features to demonstrate:**
- User registration with email verification
- Login/logout functionality
- Password reset (email sent to console)
- JWT token-based authentication
- Protected routes

**Demo Steps:**
1. Click "Sign Up" to register a new account
2. Check console for verification email
3. Login with credentials
4. Show profile page with user data

### 2. Product Catalog & Search
**Location:** http://localhost:5173/products

**Features to demonstrate:**
- Product listing with pagination
- Category filtering
- Search functionality
- Product variants (size, color)
- Stock management
- Product images and details

**Demo Steps:**
1. Browse products by category
2. Use search to find specific items
3. Click on products to view details
4. Show product variants and stock levels

### 3. Shopping Cart & Wishlist
**Location:** http://localhost:5173 (cart sidebar)

**Features to demonstrate:**
- Add/remove items from cart
- Update quantities
- Cart persistence across sessions
- Wishlist functionality
- Real-time cart updates

**Demo Steps:**
1. Add multiple products to cart
2. Update quantities
3. Add items to wishlist
4. Show cart total calculation
5. Demonstrate cart persistence

### 4. Checkout Process
**Location:** http://localhost:5173/checkout

**Features to demonstrate:**
- Address collection
- Order summary
- Payment simulation
- Order confirmation
- Email notifications (console)

**Demo Steps:**
1. Proceed to checkout
2. Fill shipping information
3. Review order summary
4. Complete purchase
5. Show order confirmation
6. Check console for email notifications

### 5. Order Management
**Location:** http://localhost:5173/orders

**Features to demonstrate:**
- Order history
- Order tracking
- Order status updates
- Order details view

**Demo Steps:**
1. View order history
2. Click on specific order
3. Show order details and status
4. Demonstrate order tracking

### 6. Admin Panel
**Location:** http://localhost:8000/admin

**Features to demonstrate:**
- Product management
- Order management
- User management
- Category management
- Analytics dashboard

**Demo Steps:**
1. Login as admin
2. Show product management
3. View and update orders
4. Manage users and categories
5. Show admin interface customization

### 7. API Endpoints
**Location:** http://localhost:8000/api

**Features to demonstrate:**
- RESTful API design
- JWT authentication
- API documentation
- Rate limiting
- CORS configuration

**Demo Steps:**
1. Show API root endpoint
2. Demonstrate authentication
3. Test product endpoints
4. Show API response format

### 8. Performance Features
**Features to demonstrate:**
- Redis caching
- Database query optimization
- Background task processing
- Real-time notifications

**Demo Steps:**
1. Show Redis cache status
2. Demonstrate fast page loads
3. Show background task processing
4. Explain performance optimizations

## 🔧 Technical Features to Highlight

### Database & Performance
- **PostgreSQL** for robust data storage
- **Redis** for caching and session storage
- **ORM optimizations** with select_related/prefetch_related
- **Database indexing** for fast queries
- **Connection pooling** for scalability

### Background Processing
- **Celery** for asynchronous tasks
- **Redis** as message broker
- **Task scheduling** with Celery Beat
- **Email notifications** processing
- **Order status updates**

### Security Features
- **JWT authentication** with refresh tokens
- **CORS configuration** for frontend integration
- **Input validation** and sanitization
- **SQL injection protection**
- **XSS protection**

### Frontend Features
- **React/TypeScript** for type safety
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Responsive design** for mobile
- **Real-time updates** with WebSocket

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Django Debug Toolbar** for development
- **Database query analysis**
- **Cache hit/miss ratios**
- **Response time monitoring**

### System Monitoring
- **Process monitoring** with systemd
- **Log rotation** and management
- **Resource usage** tracking
- **Error monitoring** and alerting

## 🛠 Troubleshooting

### Common Issues

**PostgreSQL not running:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Redis not running:**
```bash
sudo systemctl start redis
sudo systemctl enable redis
```

**Port conflicts:**
```bash
# Check what's using the ports
sudo netstat -tlnp | grep :8000
sudo netstat -tlnp | grep :5173
```

**Permission issues:**
```bash
# Fix script permissions
chmod +x *.sh

# Fix database permissions
sudo -u postgres psql -c "ALTER USER shortcut_user CREATEDB;"
```

### Reset Demo Data
```bash
# Stop services
./stop_demo.sh

# Reset database
sudo -u postgres psql -c "DROP DATABASE shortcut_store_demo;"
sudo -u postgres psql -c "CREATE DATABASE shortcut_store_demo;"

# Restart demo
./run_demo.sh
```

## 📈 Scaling Considerations

### Current Setup (Demo)
- **Database:** PostgreSQL with basic tuning
- **Cache:** Redis for sessions and caching
- **Background:** Celery with Redis broker
- **Web Server:** Django development server
- **Frontend:** Vite development server

### Production Setup
- **Database:** PostgreSQL with connection pooling
- **Cache:** Redis cluster for high availability
- **Background:** Celery with Redis/RabbitMQ
- **Web Server:** Gunicorn + Nginx
- **Frontend:** Nginx static file serving
- **Load Balancer:** Nginx upstream
- **Monitoring:** Prometheus + Grafana

## 🎯 Demo Script

### Opening (2 minutes)
1. Welcome and project overview
2. Show current e-commerce landscape
3. Introduce Shortcut Store solution

### Technical Architecture (3 minutes)
1. Show project structure
2. Explain technology stack
3. Highlight key features

### Live Demo (10 minutes)
1. **User Journey** (5 minutes)
   - Registration and login
   - Product browsing and search
   - Cart and checkout process
   - Order confirmation

2. **Admin Features** (3 minutes)
   - Product management
   - Order processing
   - User management

3. **Technical Features** (2 minutes)
   - API endpoints
   - Performance monitoring
   - Background processing

### Q&A and Next Steps (5 minutes)
1. Answer technical questions
2. Discuss deployment options
3. Outline development timeline
4. Address concerns and requirements

## 📞 Support

For technical support during the demo:
- Check the console output for errors
- Use the troubleshooting section above
- Review the logs in the terminal
- Restart services if needed with `./restart_demo.sh`

---

**Remember:** This is a demonstration environment. For production deployment, additional security, monitoring, and scaling considerations should be implemented. 