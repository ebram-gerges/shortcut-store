"""
Production settings for shortcut project.
"""
import os
from pathlib import Path
from .settings import *
import dotenv
import re

print('USING settings_production.py FOR DJANGO SETTINGS')

# Explicitly set the path to the .env file in the project root
dotenv_path = os.path.join(Path(__file__).resolve().parent.parent, '.env')
print("Loading .env from:", dotenv_path)
dotenv.load_dotenv(dotenv_path=dotenv_path, override=True)

print("DB_HOST:", os.environ.get("DB_HOST"))
print("DB_USER:", os.environ.get("DB_USER"))
print("DB_PASSWORD:", os.environ.get("DB_PASSWORD"))
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-b^lazyv&dao&g79==@g#(m-ekmq6!pfmonptv8205opyqnu$3@')

# Security settings for production
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# HTTPS Security Settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Database - PostgreSQL Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'shortcut_store'),
        'USER': os.environ.get('DB_USER', 'shortcut_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': 60,
    }
}

# Redis cache configuration
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Celery configuration
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Security middleware and settings
MIDDLEWARE.insert(0, 'corsheaders.middleware.CorsMiddleware')
MIDDLEWARE.insert(1, 'django.middleware.security.SecurityMiddleware')

# CSRF settings for production
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'

# CSRF Trusted Origins for production
CSRF_TRUSTED_ORIGINS = [
    'https://shortcut-eg.store',
    'https://www.shortcut-eg.store',
]

# Temporarily disable CSRF middleware for testing
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',  # Temporarily disabled
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# CSRF exemption for specific API endpoints
CSRF_EXEMPT_URLS = [
    r'^/api/products/questions/submit/$',
]

# Custom CSRF middleware that exempts specific URLs
class CustomCsrfViewMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the request path matches any exempt URLs
        for pattern in CSRF_EXEMPT_URLS:
            if re.match(pattern, request.path):
                request._dont_enforce_csrf_checks = True
                break
        return self.get_response(request)

# Replace the standard CSRF middleware with our custom one
# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'corsheaders.middleware.CorsMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'shortcut.settings_production.CustomCsrfViewMiddleware',  # Custom CSRF middleware
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
#     'allauth.account.middleware.AccountMiddleware',
# ]

# CORS settings for production
# CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://(www\.)?shortcut-eg\.store$",
]
CORS_ALLOW_CREDENTIALS = True

# Password hashing
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
]

# Disable Django's debug toolbar in production
if 'debug_toolbar' in INSTALLED_APPS:
    INSTALLED_APPS.remove('debug_toolbar') 

LOGIN_URL = '/admin-pZybk7TH5r8iNHvj/login/' 
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50MB 

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
] 

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
] 

# Ensure Allauth apps are included for production
if 'allauth' not in INSTALLED_APPS:
    INSTALLED_APPS += [
        'allauth',
        'allauth.account',
        'allauth.socialaccount',
        'allauth.socialaccount.providers.google',
    ]
# Do NOT re-add 'two_factor' here

# Ensure Allauth AccountMiddleware is present after AuthenticationMiddleware
if 'allauth.account.middleware.AccountMiddleware' not in MIDDLEWARE:
    idx = MIDDLEWARE.index('django.contrib.auth.middleware.AuthenticationMiddleware') + 1
    MIDDLEWARE.insert(idx, 'allauth.account.middleware.AccountMiddleware') 

# (Monkeypatch for User.is_verified removed to avoid early import issues) 
CORS_ALLOWED_ORIGINS = [
    "https://shortcut-eg.store",
    "https://www.shortcut-eg.store",
]
CORS_ALLOW_CREDENTIALS = True