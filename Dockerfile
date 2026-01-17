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

# Ensure the container runs commands via a shell (for 'cd' and chaining)
ENTRYPOINT ["bash", "-lc"]

# Start the application (Railway provides $PORT). CMD becomes the shell script argument.
# Wait for DB, run migrations, and start Gunicorn with sensible defaults.
CMD ["python3 backend/wait_for_db.py && cd backend && python3 manage.py migrate && gunicorn verdelle_nails.wsgi:application --workers ${GUNICORN_WORKERS:-3} --threads ${GUNICORN_THREADS:-2} --timeout ${GUNICORN_TIMEOUT:-120} --bind 0.0.0.0:${PORT:-8000}"]
