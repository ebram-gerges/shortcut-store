FROM python:3.11

ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies for Python and Node
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libmariadb-dev-compat \
    libmariadb-dev \
    nodejs \
    npm

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Build frontend
COPY ./frontend ./frontend
RUN cd frontend && npm install && npm run build

# Copy backend code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations
RUN python manage.py migrate

# Expose port (optional)
EXPOSE 8000

# Start the app
CMD gunicorn shortcut.wsgi:application --bind 0.0.0.0:$PORT 