#!/usr/bin/env python3
"""
Database setup script for MySQL
"""
import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).resolve().parent
sys.path.append(str(project_root))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shortcut.settings_production')

# Setup Django
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection

def setup_database():
    """Setup the database and run migrations"""
    print("🗄️ Setting up MySQL database...")
    
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            print("✅ Database connection successful!")
        
        # Run migrations
        print("🔄 Running migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Create superuser if needed
        print("👤 Creating superuser...")
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(email='admin@shortcut.com').exists():
            User.objects.create_superuser(
                email='admin@shortcut.com',
                password='admin123',
                username='admin'
            )
            print("✅ Superuser created: admin@shortcut.com / admin123")
        else:
            print("ℹ️ Superuser already exists")
        
        print("✅ Database setup complete!")
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Make sure MySQL is running")
        print("2. Check your environment variables:")
        print("   - DB_NAME")
        print("   - DB_USER") 
        print("   - DB_PASSWORD")
        print("   - DB_HOST")
        print("   - DB_PORT")
        print("3. Ensure the database exists")
        print("4. Check user permissions")

if __name__ == "__main__":
    setup_database() 