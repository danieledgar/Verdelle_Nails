FROM python:3.11-slim

# Environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (minimal) for building wheels when needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN python3 -m pip install --upgrade pip \
    && python3 -m pip install -r /app/backend/requirements.txt

# Copy project
COPY . /app

# Collect static files during build
RUN cd backend && python3 manage.py collectstatic --noinput

EXPOSE 8000

# Start the application (Railway provides $PORT)
CMD ["bash", "-lc", "cd backend && python3 manage.py migrate && python3 populate_services.py && gunicorn verdelle_nails.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
