#!/bin/bash

# Shortcut Store - Restart Demo Script
# This script stops all demo services and restarts them

echo "🔄 Restarting Shortcut Store Demo Services..."
echo "============================================="

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

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo -e "${RED}[ERROR]${NC} Please run this script from the shortcut-store root directory"
    exit 1
fi

# Stop all services first
print_status "Stopping all demo services..."
./stop_demo.sh

# Wait a moment for services to fully stop
sleep 2

echo ""
print_status "Starting demo services..."
echo ""

# Start the demo
./run_demo.sh 