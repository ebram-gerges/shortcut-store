"""
Local development settings for shortcut project with MySQL.
"""
import os
import pymysql
from pathlib import Path
from .settings import *

# Configure PyMySQL to work with Django
pymysql.install_as_MySQLdb()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-b^lazyv&dao&g79==@g#(m-ekmq6!pfmonptv8205opyqnu$3@'

ALLOWED_HOSTS = ['*']

# Database - MySQL Configuration for Local Development with PyMySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'shortcut_store12'),
        'USER': os.environ.get('DB_USER', 'shortcut_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'shortcut_store12'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://1b35-196-131-168-107.ngrok-free.app",  # ngrok frontend
]

# CSRF Trusted Origins
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://1b35-196-131-168-107.ngrok-free.app",  # ngrok frontend
]

# Email configuration for development
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'shortcut756@gmail.com'
EMAIL_HOST_PASSWORD = 'wijpdbtlxdfseuxq'  # App password
DEFAULT_FROM_EMAIL = 'shortcut756@gmail.com' 