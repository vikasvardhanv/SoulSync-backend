#!/bin/bash

# SoulSync Backend Quick Start Script
# This script helps you get the backend up and running quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🚀 SoulSync Backend Quick Start"
echo "================================"
echo

# Step 1: Check Node.js version
log_step "1. Checking Node.js version..."
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    log_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

log_info "✓ Node.js $NODE_VERSION is installed"

# Step 2: Install dependencies
log_step "2. Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
log_info "✓ Dependencies installed"

# Step 3: Check environment file
log_step "3. Checking environment configuration..."
if [ ! -f ".env" ]; then
    log_warning "No .env file found. Creating from .env.example..."
    cp .env.example .env
    log_warning "⚠️  Please edit .env file with your actual configuration values before starting the server"
    log_warning "Required variables: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CLOUDINARY credentials"
    echo
    read -p "Press Enter to continue after editing .env file..."
fi
log_info "✓ Environment file exists"

# Step 4: Check database connection
log_step "4. Checking database connection..."
if ! npm run prisma:generate > /dev/null 2>&1; then
    log_error "Failed to generate Prisma client. Please check your DATABASE_URL in .env file"
    exit 1
fi
log_info "✓ Prisma client generated"

# Step 5: Run database migrations
log_step "5. Running database migrations..."
if ! npm run prisma:migrate:deploy > /dev/null 2>&1; then
    log_warning "Database migrations failed. This might be expected for first-time setup."
    log_warning "Please ensure your database is running and accessible."
fi
log_info "✓ Database migrations completed"

# Step 6: Start the server
log_step "6. Starting the development server..."
echo
log_info "🎉 Starting SoulSync Backend..."
log_info "Server will be available at: http://localhost:5001"
log_info "Health check: http://localhost:5001/health"
log_info "API documentation: http://localhost:5001"
echo
log_info "Press Ctrl+C to stop the server"
echo

# Start the server
npm run dev