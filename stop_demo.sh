#!/bin/bash

# Shortcut Store - Stop Demo Script
# This script stops all demo services

echo "🛑 Stopping Shortcut Store Demo Services..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop Django server
if [ -f "django.pid" ]; then
    DJANGO_PID=$(cat django.pid)
    if kill -0 $DJANGO_PID 2>/dev/null; then
        print_status "Stopping Django server (PID: $DJANGO_PID)..."
        kill $DJANGO_PID
        print_success "Django server stopped"
    else
        print_warning "Django server already stopped"
    fi
    rm -f django.pid
else
    print_warning "Django PID file not found"
fi

# Stop frontend server
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_status "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        print_success "Frontend server stopped"
    else
        print_warning "Frontend server already stopped"
    fi
    rm -f frontend.pid
else
    print_warning "Frontend PID file not found"
fi

# Stop Celery workers
print_status "Stopping Celery workers..."
pkill -f "celery.*worker" || print_warning "No Celery workers found"

# Stop Celery beat
print_status "Stopping Celery beat..."
pkill -f "celery.*beat" || print_warning "No Celery beat found"

# Clean up any remaining Celery processes
print_status "Cleaning up Celery processes..."
pkill -f "celery" || print_warning "No Celery processes found"

# Deactivate virtual environment if active
if [ -n "$VIRTUAL_ENV" ]; then
    print_status "Deactivating virtual environment..."
    deactivate
fi

echo ""
print_success "All demo services stopped successfully!"
echo ""
echo "📋 Services stopped:"
echo "  ✅ Django development server"
echo "  ✅ Frontend development server"
echo "  ✅ Celery workers"
echo "  ✅ Celery beat scheduler"
echo ""
echo "💡 To restart the demo, run: ./restart_demo.sh"
echo "🚀 To start fresh, run: ./run_demo.sh" 