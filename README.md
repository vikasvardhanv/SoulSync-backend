# SoulSync Backend API

A Node.js/Express backend API for the SoulSync spiritual connection and dating platform. This is a standalone, production-ready backend server that can be deployed independently of the frontend.

## 🌟 Features

- **RESTful API** with comprehensive endpoints for user management, matching, messaging, and payments
- **Authentication & Authorization** with JWT tokens and refresh tokens
- **Database Management** with Prisma ORM and PostgreSQL
- **File Upload** integration with Cloudinary
- **Payment Processing** with PayPal and crypto payment support
- **Email Services** with Nodemailer
- **Rate Limiting** and security middleware
- **Health Monitoring** with built-in health check endpoints
- **Production Ready** with Docker, PM2, and Nginx configurations

## 🛠 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Process Manager**: PM2
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Payment**: PayPal API, Coinbase Commerce

## 📋 Prerequisites

Before running this application, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager
- Docker (optional, for containerized deployment)
- PM2 (optional, for process management)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/soulsync-backend.git
cd soulsync-backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` file with your actual configuration values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/soulsync_db"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-different-from-jwt-secret"

# CORS Configuration
CORS_ORIGIN="https://soulsync.solutions,https://www.soulsync.solutions"

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email Configuration
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# External APIs
OPENAI_API_KEY="sk-your-openai-api-key-here"
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:deploy

# (Optional) Seed database with initial data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5001`

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Start all services (backend + database)
npm run docker:dev

# Or manually:
docker-compose up --build
```

### Production with Docker

```bash
# Build and run production containers
npm run docker:prod

# Or manually:
docker-compose -f docker-compose.prod.yml up --build
```

## 🔧 Production Deployment

### Method 1: PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start production server
npm run pm2:start

# Monitor processes
pm2 monit

# View logs
npm run pm2:logs
```

### Method 2: Manual Deployment Script

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production

# Deploy to staging
./deploy.sh staging
```

### Method 3: Docker Production

```bash
# Build production image
docker build -t soulsync-backend:production .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Nginx Configuration

For production deployments with Nginx reverse proxy:

1. Copy the nginx configuration:
```bash
sudo cp nginx/nginx.conf /etc/nginx/sites-available/soulsync-backend
sudo ln -s /etc/nginx/sites-available/soulsync-backend /etc/nginx/sites-enabled/
```

2. Add your SSL certificates to `nginx/ssl/` directory:
   - `soulsync.solutions.crt`
   - `soulsync.solutions.key`

3. Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/HTTPS Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.soulsync.solutions

# Auto-renewal (add to cron)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Custom Certificates

Place your SSL certificates in the `nginx/ssl/` directory:
- `soulsync.solutions.crt` (Certificate file)
- `soulsync.solutions.key` (Private key file)

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```bash
curl http://localhost:5001/health
```

Response:
```json
{
  "status": "OK",
  "message": "SoulSync Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### PM2 Monitoring

```bash
# View all processes
pm2 list

# Monitor resources
pm2 monit

# View logs
pm2 logs soulsync-backend

# Restart application
pm2 restart soulsync-backend
```

## 🏗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Password reset request

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-photo` - Upload profile photo
- `DELETE /api/users/account` - Delete user account

### Matches & Discovery
- `GET /api/matches/discover` - Discover potential matches
- `POST /api/matches/like` - Like a user
- `POST /api/matches/pass` - Pass on a user
- `GET /api/matches/mutual` - Get mutual matches

### Messages
- `GET /api/messages/:matchId` - Get messages for a match
- `POST /api/messages` - Send a message
- `PUT /api/messages/:id/read` - Mark message as read

### Subscriptions & Payments
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/payments/create-paypal-order` - Create PayPal payment
- `POST /api/payments/capture-paypal-order` - Capture PayPal payment

### Questions & Compatibility
- `GET /api/questions` - Get compatibility questions
- `POST /api/questions/answers` - Submit question answers

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ chars) | `your-super-secret-jwt-key` |
| `JWT_REFRESH_SECRET` | ✅ | JWT refresh secret | `your-refresh-secret` |
| `CORS_ORIGIN` | ✅ | Allowed frontend origins | `https://soulsync.solutions` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret | `your-api-secret` |
| `SMTP_USER` | ❌ | Email SMTP username | `noreply@soulsync.solutions` |
| `SMTP_PASS` | ❌ | Email SMTP password | `your-app-password` |
| `OPENAI_API_KEY` | ❌ | OpenAI API key for AI features | `sk-your-openai-key` |
| `PAYPAL_CLIENT_ID` | ❌ | PayPal client ID | `your-paypal-client-id` |
| `PAYPAL_CLIENT_SECRET` | ❌ | PayPal client secret | `your-paypal-secret` |

## 🧪 Testing

```bash
# Run health check
curl http://localhost:5001/health

# Test API endpoints
curl http://localhost:5001/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📋 Database Management

### Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (development)
npm run prisma:migrate:dev

# Deploy migrations (production)
npm run prisma:migrate:deploy

# Reset database (development only)
npm run prisma:reset

# Open Prisma Studio
npm run prisma:studio
```

### Backup & Restore

```bash
# Create database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 5001
   lsof -i :5001
   # Kill the process
   kill -9 <PID>
   ```

2. **Database connection issues**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL format
   - Check firewall settings

3. **Prisma migration errors**
   ```bash
   # Reset and regenerate
   npm run prisma:reset
   npm run prisma:generate
   ```

4. **Permission errors (Linux/Mac)**
   ```bash
   # Fix log directory permissions
   sudo chown -R $USER:$USER logs/
   chmod 755 logs/
   ```

### Logs & Debugging

```bash
# PM2 logs
pm2 logs soulsync-backend

# Docker logs
docker-compose logs soulsync-backend

# Application logs (if using file logging)
tail -f logs/combined.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: This README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/your-username/soulsync-backend/issues)
- **Email**: support@soulsync.solutions

## 📚 Related Projects

- **Frontend**: [SoulSync Frontend](https://github.com/your-username/soulsync-frontend)
- **Mobile App**: [SoulSync Mobile](https://github.com/your-username/soulsync-mobile)

## 🏆 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Backup strategy in place
- [ ] Monitoring setup (optional)

### Production Checklist
- [ ] NODE_ENV=production
- [ ] Strong JWT secrets (32+ characters)
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] HTTPS/SSL enabled
- [ ] Database backups automated
- [ ] Log rotation configured
- [ ] Process monitoring (PM2/Docker health checks)
- [ ] Error tracking (Sentry, optional)

### Security Checklist
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] API rate limiting active
- [ ] Input validation enabled
- [ ] Security headers configured
- [ ] Secrets not in version control
- [ ] Regular security updates

---

**Made with ❤️ for SoulSync - Connecting Hearts Through Spiritual Harmony**