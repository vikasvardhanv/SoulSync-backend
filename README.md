# SoulSync Backend API

A spiritual connection and dating platform backend built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **User Management**: Profile creation, editing, and image uploads
- **AI-Powered Matching**: Compatibility algorithm based on personality quizzes
- **Real-time Messaging**: Chat system for matched users
- **Payment Integration**: NOWPayments crypto payment support
- **Subscription Management**: Premium and VIP subscription tiers
- **Notifications**: Real-time notifications for matches and messages
- **Location-based Matching**: Find matches near you
- **Question Bank**: Dynamic personality and compatibility questions

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- npm >= 8.0.0

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vikasvardhanv/soulsync-backend.git
   cd soulsync-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5001
   NODE_ENV=production
   
   # Database Configuration
   PRISMA_DATABASE_URL="your_prisma_accelerate_url"
   DATABASE_URL="your_postgres_connection_string"
   
   # JWT Configuration
   JWT_SECRET="your_strong_jwt_secret"
   JWT_EXPIRES_IN="7d"
   JWT_REFRESH_SECRET="your_strong_refresh_secret"
   JWT_REFRESH_EXPIRES_IN="30d"
   
   # OpenAI Configuration (optional)
   OPENAI_API_KEY="your_openai_api_key"
   
   # NOWPayments Configuration
   NOWPAYMENTS_API_KEY="your_nowpayments_api_key"
   NOWPAYMENTS_IPN_SECRET="your_nowpayments_ipn_secret"
   
   # Email Configuration
   EMAIL_SERVICE="gmail"
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASS="your_app_password"
   EMAIL_FROM="SoulSync <noreply@soulsync.solutions>"
   
   # Security
   BCRYPT_ROUNDS=12
   CORS_ORIGIN="https://your-frontend-domain.com"
   
   # Frontend URL
   FRONTEND_URL="https://your-frontend-domain.com"
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate:deploy
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using Docker
```bash
# Development
npm run docker:dev

# Production
npm run docker:prod
```

### Using PM2
```bash
npm run pm2:start
npm run pm2:logs
npm run pm2:restart
npm run pm2:stop
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/matches` - Get potential matches
- `DELETE /api/users/account` - Delete account

### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create a new match
- `PUT /api/matches/:id/status` - Update match status
- `GET /api/matches/pending` - Get pending matches
- `GET /api/matches/accepted` - Get accepted matches

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversation/:userId` - Get conversation with user
- `POST /api/messages` - Send a message
- `PUT /api/messages/read/:senderId` - Mark messages as read
- `GET /api/messages/unread/count` - Get unread message count

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/random/:count` - Get random questions
- `POST /api/questions/:id/answer` - Submit answer
- `GET /api/questions/answers/me` - Get my answers

### Payments
- `GET /api/payments/currencies` - Get available currencies
- `POST /api/payments/estimate` - Estimate payment
- `POST /api/payments/create` - Create payment
- `GET /api/payments/status/:id` - Get payment status
- `POST /api/payments/subscription` - Create subscription payment

### Subscriptions
- `GET /api/subscriptions/me` - Get my subscription
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/cancel` - Cancel subscription

### Images
- `POST /api/images/upload` - Upload single image
- `POST /api/images/upload-multiple` - Upload multiple images
- `DELETE /api/images/delete` - Delete image
- `PUT /api/images/reorder` - Reorder photos

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Locations
- `GET /api/locations/cities` - Get cities
- `GET /api/locations/cities/country/:country` - Get cities by country
- `GET /api/locations/cities/nearby` - Get nearby cities

## 🏗️ Project Structure

```
soulsync-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── server.js              # Main server file
│   ├── database/
│   │   ├── connection.js      # Database connection
│   │   └── seed.js            # Database seeding
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   ├── errorHandler.js   # Error handling middleware
│   │   └── logger.js          # Logging middleware
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User routes
│   │   ├── matches.js         # Match routes
│   │   ├── messages.js        # Message routes
│   │   ├── questions.js       # Question routes
│   │   ├── payments.js        # Payment routes
│   │   ├── subscriptions.js   # Subscription routes
│   │   ├── images.js          # Image routes
│   │   ├── notifications.js   # Notification routes
│   │   └── locations.js       # Location routes
│   ├── services/
│   │   ├── emailService.js    # Email service
│   │   ├── matchingAlgorithm.js  # Matching algorithm
│   │   └── enhancedMatching.js   # Enhanced matching
│   └── data/
│       └── locationData.js    # Location data
├── .env                       # Environment variables
├── package.json               # Dependencies
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose config
└── ecosystem.config.js        # PM2 configuration
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Protection**: Configurable CORS origins
- **Helmet.js**: Security headers
- **Input Validation**: express-validator for all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts and profiles
- **Match**: User matches and compatibility scores
- **Message**: Chat messages between matched users
- **Question**: Personality and compatibility questions
- **UserAnswer**: User responses to questions
- **Subscription**: Premium subscription management
- **Payment**: Payment transactions
- **Notification**: User notifications
- **Image**: User uploaded images

## 📊 Matching Algorithm

The matching algorithm considers:

1. **Personality Compatibility** (weight: 2.5)
2. **Values Alignment** (weight: 2.5)
3. **Lifestyle Compatibility** (weight: 1.5)
4. **Communication Style** (weight: 1.5)
5. **Relationship Goals** (weight: 1.0)
6. **Location Proximity** (bonus: up to 2.0)
7. **Shared Interests** (bonus: up to 1.0)

Compatibility scores range from 0-10, with higher scores indicating better matches.

## 🚀 Deployment to Render.com (Recommended - FREE)

### Quick Deploy (5 minutes):

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub (NO credit card required)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select "soulsync-backend"

3. **Configure Service**
   - Name: `soulsync-backend`
   - Region: Choose closest to you
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**

4. **Add Environment Variables**
   - Copy from your `.env` file
   - Add each variable in Render dashboard

5. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes
   - Your API will be at: `https://soulsync-backend.onrender.com`

See `RENDER-DEPLOYMENT.md` for detailed instructions.

### Docker Deployment

```bash
docker build -t soulsync-backend .
docker run -p 5001:5001 --env-file .env soulsync-backend
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PRISMA_DATABASE_URL` | Prisma Accelerate URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes |
| `NOWPAYMENTS_API_KEY` | NOWPayments API key | No |
| `EMAIL_USER` | Email service username | No |
| `EMAIL_PASS` | Email service password | No |
| `CORS_ORIGIN` | Allowed CORS origins | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For support, email support@soulsync.solutions or open an issue in the repository.

---

Made with ❤️ by the SoulSync Team
