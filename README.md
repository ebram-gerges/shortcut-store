# Shortcut Store

A modern e-commerce platform built with Django and React.

## Features

- 🛍️ **Product Management** - Complete product catalog with variants, colors, and sizes
- 🛒 **Shopping Cart** - Persistent cart with real-time updates
- 👤 **User Authentication** - Secure user registration and login
- 💳 **Order Management** - Complete order processing and tracking
- ⭐ **Reviews & Ratings** - Product reviews and rating system
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔍 **Search & Filter** - Advanced product search and filtering
- 📱 **Mobile Responsive** - Optimized for all devices

## Tech Stack

### Backend
- **Django 5.2** - Web framework
- **PostgreSQL** - Database
- **Redis** - Caching and session storage
- **Celery** - Background task processing
- **Gunicorn** - WSGI server
- **Nginx** - Reverse proxy

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shortcut-store
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your database and other settings
   ```

4. **Set up database**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Development

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Production Deployment

### Using the deployment script

1. **Run the production deployment script**
   ```bash
   chmod +x deploy_production.sh
   ./deploy_production.sh
   ```

2. **The script will automatically:**
   - Set up Gunicorn service
   - Configure Nginx
   - Set up logging
   - Start all services

### Manual deployment

1. **Set up Gunicorn**
   ```bash
   gunicorn shortcut.wsgi:application --bind 127.0.0.1:8000
   ```

2. **Configure Nginx** (see `nginx/shortcut-store.conf`)

3. **Set up systemd services** (see `systemd/` directory)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=shortcut_store
DB_USER=shortcut_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Project Structure

```
shortcut-store/
├── accounts/          # User authentication and profiles
├── products/          # Product management
├── cart/             # Shopping cart functionality
├── orders/           # Order processing
├── reviews/          # Product reviews
├── frontend/         # React frontend
├── static/           # Static files
├── templates/        # Django templates
├── shortcut/         # Django project settings
└── manage.py         # Django management script
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@shortcut-eg.store or create an issue in the repository. 