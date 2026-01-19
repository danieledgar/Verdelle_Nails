"""
Django settings for Verdelle Nails project.
"""

from pathlib import Path
from decouple import config
import os
import dj_database_url
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-verdelle-nails-change-in-production')

DEBUG = config('DEBUG', default=True, cast=bool)

# --- HOSTS SETTINGS ---
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Explicitly add your railway domain to be safe
ALLOWED_HOSTS.append('verdellenails.up.railway.app')

if config('RAILWAY_ENVIRONMENT', default=None):
    RAILWAY_STATIC_URL = config('RAILWAY_STATIC_URL', default=None)
    if RAILWAY_STATIC_URL:
        # Clean up the URL to just the domain for ALLOWED_HOSTS
        host = RAILWAY_STATIC_URL.replace('https://', '').replace('http://', '')
        ALLOWED_HOSTS.append(host)
    ALLOWED_HOSTS.append('.railway.app')

# Additional allowed hosts
ALLOWED_HOSTS.extend([
    '*',  # Note: usage of '*' is generally safe here if controlled by upstream proxy/firewall
])


# Helper to normalize origins to include scheme as required by Django>=4
def normalize_origin(value):
    if not value:
        return []
    value = value.strip()
    if value.startswith('http://') or value.startswith('https://'):
        return [value]
    # If no scheme provided, allow both https and http forms
    return [f'https://{value}', f'http://{value}']


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'verdelle_nails.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'verdelle_nails.wsgi.application'

# Database
# Prefer DATABASE_URL if provided (common on Railway), else use individual env vars
DATABASE_URL = config('DATABASE_URL', default=None)
# On Railway (or when forced), require DATABASE_URL and do not fall back.
RAILWAY_ENV = config('RAILWAY_ENVIRONMENT', default=None)
FORCE_DATABASE_URL_ONLY = config('FORCE_DATABASE_URL_ONLY', default=False, cast=bool)

if not DATABASE_URL and (RAILWAY_ENV or FORCE_DATABASE_URL_ONLY):
    raise ImproperlyConfigured('DATABASE_URL must be set in this environment.')

if DATABASE_URL:
    DB_SSL_REQUIRE = config('DB_SSL_REQUIRE', default=False, cast=bool)
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=DB_SSL_REQUIRE
        )
    }
else:
    # Local development fallback (when not on Railway and not forced)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='verdelle_nails'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='postgres'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
            'CONN_MAX_AGE': 600,
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- CORS & CSRF SETTINGS ---

# 1. Trusted Origins for CSRF (Fixing the 403 Error)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    # FIX: Explicitly add the Railway URL with https scheme
    "https://verdellenails.up.railway.app",
]

# 2. Allowed Origins for CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Add production frontend URL(s), ensuring scheme(s) are present
FRONTEND_URL = config('FRONTEND_URL', default=None)
CORS_ALLOWED_ORIGINS.extend(normalize_origin(FRONTEND_URL))
CSRF_TRUSTED_ORIGINS.extend(normalize_origin(FRONTEND_URL))

# Optional: support multiple comma-separated frontend URLs via FRONTEND_URLS
FRONTEND_URLS = [u.strip() for u in config('FRONTEND_URLS', default='').split(',') if u.strip()]
for u in FRONTEND_URLS:
    CORS_ALLOWED_ORIGINS.extend(normalize_origin(u))
    CSRF_TRUSTED_ORIGINS.extend(normalize_origin(u))

# Add Railway Dynamic URL (if available) to CSRF
RAILWAY_STATIC_URL = config('RAILWAY_STATIC_URL', default=None)
CSRF_TRUSTED_ORIGINS.extend(normalize_origin(RAILWAY_STATIC_URL))

CORS_ALLOW_CREDENTIALS = True


# REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

# Custom User Model
AUTH_USER_MODEL = 'api.User'

# M-Pesa Configuration
MPESA_ENVIRONMENT = config('MPESA_ENVIRONMENT', default='sandbox')
MPESA_CONSUMER_KEY = config('MPESA_CONSUMER_KEY', default='')
MPESA_CONSUMER_SECRET = config('MPESA_CONSUMER_SECRET', default='')
MPESA_SHORTCODE = config('MPESA_SHORTCODE', default='174379')
MPESA_PASSKEY = config('MPESA_PASSKEY', default='bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919')
MPESA_CALLBACK_URL = config('MPESA_CALLBACK_URL', default='https://your-domain.com/api/mpesa/callback/')

# Security Settings for Production
if not DEBUG:
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Session Settings
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = False
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': config('DJANGO_LOG_LEVEL', default='INFO'),
            'propagate': False,
        },
    },
}