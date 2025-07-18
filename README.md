# URL Shortener Application

A full-stack URL shortener application built with React (frontend) and Node.js/Express (backend), featuring analytics, custom shortcodes, and MongoDB storage.

## Features

- **URL Shortening**: Convert long URLs into short, manageable links
- **Custom Shortcodes**: Optional user-defined shortcodes
- **Analytics**: Track clicks, timestamps, and geographical data
- **Responsive Design**: Modern Material-UI interface
- **Real-time Statistics**: Comprehensive click analytics and statistics
- **Bulk Operations**: Shorten up to 5 URLs simultaneously
- **Expiration Management**: Configurable URL validity periods

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for styling
- Vite for build tooling
- Axios for API communication

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Custom logging middleware
- CORS enabled for cross-origin requests

## Project Structure

```
url-shortener/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API and logging services
│   │   ├── theme/          # Material-UI theme
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── backend/                # Node.js backend API
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Custom middlewares
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── package.json
├── logging-middleware/     # Custom logging package
└── README.md
```

## API Endpoints

### Create Short URL
- **POST** `/shorturls`
- **Body**: 
  ```json
  {
    "url": "https://example.com/very-long-url",
    "validity": 30,
    "shortcode": "custom"
  }
  ```
- **Response**:
  ```json
  {
    "shortLink": "http://localhost:5001/custom",
    "expiry": "2025-01-01T00:30:00.000Z"
  }
  ```

### Get URL Statistics
- **GET** `/shorturls/:shortcode`
- **Response**: Detailed analytics including click count, timestamps, and geographical data

### Redirect to Original URL
- **GET** `/:shortcode`
- **Response**: HTTP 302 redirect to original URL

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/url-shortener
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```env
   VITE_BACKEND_URL=http://localhost:5001
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## Usage

### Shortening URLs

1. Open the application in your browser
2. Enter the long URL you want to shorten
3. Optionally set validity period (default: 30 minutes)
4. Optionally provide a custom shortcode
5. Click "Shorten URL" to generate the short link

### Viewing Statistics

1. Navigate to the "Statistics" tab
2. View all created short URLs and their analytics
3. See detailed information including:
   - Total clicks
   - Click timestamps
   - Geographical data
   - Creation and expiry dates

## Configuration

### URL Validity
- Default validity: 30 minutes
- Configurable per URL
- Automatic cleanup of expired URLs

### Custom Shortcodes
- Alphanumeric characters only
- Must be unique
- Automatically generated if not provided

### Database
- MongoDB for persistent storage
- Automatic indexing for performance
- Built-in data validation

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Logging
The application includes comprehensive logging for monitoring and debugging:
- Request/response logging
- Error tracking
- User interaction logging
- API call monitoring

## Production Deployment

### Backend Deployment
1. Set production environment variables
2. Use process manager (PM2, Docker)
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates
5. Monitor logs and performance

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve static files via web server
3. Configure environment variables
4. Set up CDN for assets

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions, please open an issue in the repository.

## 🚀 Features

### Backend Microservice
- **RESTful API** with exact specification compliance
- **Custom Shortcodes** support with validation
- **Configurable Validity** period (default: 30 minutes)
- **Comprehensive Analytics** with click tracking
- **Location Tracking** with geographic data
- **Referrer Tracking** and user agent analysis
- **Extensive Logging** using custom middleware
- **No Authentication Required** (pre-authorized access)
- **MongoDB Integration** for data persistence

### Frontend React Application
- **Material UI Design** for modern, responsive interface
- **Concurrent URL Processing** (up to 5 URLs at once)
- **Client-Side Validation** before API calls
- **Real-time Statistics** display
- **Responsive Design** optimized for all devices
- **Running on http://localhost:3000** as required

## 📋 API Endpoints

### Create Short URL
```http
POST /shorturls
Content-Type: application/json

{
  "url": "https://very-very-very-long-and-descriptive-subdomain-that-goes-on-and-on.somedomain.com/additional/directory/levels/for/more/length/really-log-sub-domain/a-really-log-page",
  "validity": 30,
  "shortcode": "abcd1"
}
```

**Response (201):**
```json
{
  "shortLink": "http://localhost:5001/abcd1",
  "expiry": "2025-07-14T15:30:00.000Z"
}
```

### Retrieve URL Statistics
```http
GET /shorturls/:shortcode
```

**Response (200):**
```json
{
  "shortcode": "abcd1",
  "originalUrl": "https://example.com",
  "createdAt": "2025-07-14T15:00:00.000Z",
  "expiryDate": "2025-07-14T15:30:00.000Z",
  "isExpired": false,
  "totalClicks": 5,
  "clickDetails": [
    {
      "timestamp": "2025-07-14T15:05:00.000Z",
      "referrer": "https://google.com",
      "location": "San Francisco, California, United States",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

### URL Redirection
```http
GET /:shortcode
```
Redirects to the original URL and records analytics data.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (>= 14.0.0)
- MongoDB (local or cloud)
- npm (>= 6.0.0)

### Quick Start
1. Clone and install dependencies:
   ```bash
   git clone <repository-url>
   cd url-shortener
   npm run install-deps
   ```

2. Start both services:
   ```bash
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:3002 (auto-assigned)
   - Backend: http://localhost:5001
   - MongoDB: Configured via environment

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup  
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Project Architecture

```
url-shortener/
├── backend/
│   ├── controllers/         # Business logic
│   │   └── urlController.js # URL operations
│   ├── middlewares/         # Custom middleware
│   │   └── logger.js        # Logging system
│   ├── models/             # Database schemas
│   │   └── Url.js          # URL model with analytics
│   ├── routes/             # API routes
│   │   └── urlRoutes.js    # URL endpoints
│   ├── logs/               # Application logs
│   │   ├── app.log         # General logs
│   │   ├── error.log       # Error logs
│   │   └── debug.log       # Debug logs
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UrlShortenerPage.tsx  # URL creation
│   │   │   └── StatisticsPage.tsx    # Analytics dashboard
│   │   └── App.tsx         # Main application
│   └── package.json
└── package.json
```

## 📊 Analytics & Monitoring

### Comprehensive Logging
The application extensively uses a custom logging middleware that captures:
- **HTTP Requests/Responses** with timing
- **URL Creation Events** with validation details  
- **Click Analytics** with geographic data
- **Error Events** with stack traces
- **Performance Metrics** and system health

### Click Analytics
Each URL redirect captures:
- **Timestamp** of access
- **Referrer Source** (website/direct)
- **Geographic Location** (city, region, country)
- **User Agent** information
- **IP Address** for security

### Real-time Dashboard
- **Live Statistics** with auto-refresh
- **Click History** with detailed breakdowns
- **Performance Metrics** and trends
- **Status Monitoring** (active/expired)

## 🎯 Requirements Compliance

| Requirement | Status | Implementation |
|------------|--------|----------------|
| **Mandatory Logging Integration** | ✅ | Custom middleware extensively used throughout |
| **Microservice Architecture** | ✅ | Single service handling all specified endpoints |
| **No Authentication Required** | ✅ | Pre-authorized access model implemented |
| **Unique Short Links** | ✅ | Global uniqueness with collision detection |
| **30-minute Default Validity** | ✅ | Configurable expiration with minute precision |
| **Custom Shortcodes** | ✅ | Optional user-provided codes with validation |
| **Proper Redirection** | ✅ | HTTP redirects with full analytics capture |
| **Robust Error Handling** | ✅ | Comprehensive HTTP status codes & JSON responses |
| **Material UI Frontend** | ✅ | Modern React application with Material UI |
| **Localhost:3000 Requirement** | ✅ | Frontend configured for specified port |
| **Backend API Integration** | ✅ | No client-side URL shortening logic |
| **5 Concurrent URLs** | ✅ | Parallel processing with validation |
| **Client-Side Validation** | ✅ | Pre-API call input validation |
| **Statistics Dashboard** | ✅ | Comprehensive analytics with detailed views |

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/url-shortener
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5001
VITE_PORT=3000
```

## 🧪 Testing & Validation

### Functional Testing
1. **URL Shortening**: Test with various URL formats
2. **Custom Shortcodes**: Validate alphanumeric constraints
3. **Validity Periods**: Test expiration behavior
4. **Analytics**: Verify click tracking accuracy
5. **Error Handling**: Test invalid inputs and edge cases

### API Testing Examples
```bash
# Create a short URL
curl -X POST http://localhost:5001/shorturls \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-url",
    "validity": 60,
    "shortcode": "test123"
  }'

# Get statistics
curl http://localhost:5001/shorturls/test123

# Test redirect
curl -I http://localhost:5001/test123
```

## 📈 Performance Features

- **Efficient Database Queries** with proper indexing
- **Connection Pooling** for MongoDB
- **Structured Logging** with JSON format
- **Client-Side Optimization** with Material UI
- **Error Boundaries** for graceful failure handling

## 🚀 Production Deployment

For production deployment:
1. **Environment Configuration**: Update URLs and secrets
2. **Database Setup**: Configure production MongoDB
3. **SSL/TLS**: Implement HTTPS certificates  
4. **Load Balancing**: Set up reverse proxy
5. **Monitoring**: Configure logging aggregation

## 📞 Support & Documentation

- **Extensive Logging**: Check `backend/logs/` for detailed information
- **Error Tracking**: All errors logged with stack traces
- **API Documentation**: RESTful endpoints with JSON responses
- **Source Code**: Well-documented with inline comments

---

**Developed for Aford Medical Technologies Private Limited**  
**Campus Hiring Evaluation - Pre-Test Implementation**

*This implementation demonstrates professional software development practices with comprehensive logging, error handling, and user experience design.*
