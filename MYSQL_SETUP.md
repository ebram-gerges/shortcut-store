# MySQL Setup for Shortcut Store

## Prerequisites

1. **Install MySQL Server**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # macOS (using Homebrew)
   brew install mysql
   
   # Windows
   # Download from https://dev.mysql.com/downloads/mysql/
   ```

2. **Start MySQL Service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mysql
   sudo systemctl enable mysql
   
   # macOS
   brew services start mysql
   ```

3. **Install Python Dependencies**
   ```bash
   # No system-level MySQL libraries needed with PyMySQL!
   pip install -r requirements.txt
   ```

## Database Setup

### 1. Create Database and User

Connect to MySQL as root:
```bash
sudo mysql -u root -p
```

Run the setup script:
```sql
source create_mysql_db.sql;
```

Or manually:
```sql
CREATE DATABASE shortcut_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shortcut_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON shortcut_store.* TO 'shortcut_user'@'%';
FLUSH PRIVILEGES;
```

### 2. Set Environment Variables

Create a `.env` file in the project root:
```bash
# Database Configuration
DB_NAME=shortcut_store
DB_USER=shortcut_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=3306

# Django Configuration
DJANGO_SETTINGS_MODULE=shortcut.settings_local
SECRET_KEY=your-secret-key-here

# Email Configuration
EMAIL_HOST_USER=shortcut756@gmail.com
EMAIL_HOST_PASSWORD=wijpdbtlxdfseuxq
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Database Setup

```bash
python setup_database.py
```

### 5. Test the Setup

```bash
# Run Django development server
python manage.py runserver

# In another terminal, run React frontend
cd frontend
npm install
npm run dev
```

## Production Deployment

For production deployment, set these environment variables:

```bash
DJANGO_SETTINGS_MODULE=shortcut.settings_production
DB_NAME=shortcut_store
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_HOST=your_mysql_host
DB_PORT=3306
SECRET_KEY=your_production_secret_key
ALLOWED_HOSTS=your-domain.com
```

## Advantages of PyMySQL

- **No system dependencies**: PyMySQL is a pure Python MySQL client
- **Easier deployment**: Works on any platform without MySQL development libraries
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Production ready**: Used by many Django applications in production

## Troubleshooting

### Common Issues:

1. **"Access denied for user"**
   - Check if the user exists and has correct permissions
   - Verify the password is correct
   - Ensure the user can connect from your application's host

2. **"Database doesn't exist"**
   - Create the database first
   - Check the database name in your environment variables

3. **"Connection refused"**
   - Make sure MySQL is running
   - Check if the port is correct (default: 3306)
   - Verify firewall settings

### Testing Connection:

```bash
# Test MySQL connection
mysql -u shortcut_user -p shortcut_store

# Test Django connection
python manage.py dbshell
``` 