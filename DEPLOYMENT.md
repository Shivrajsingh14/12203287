# URL Shortener - Production Deployment Guide

## Environment Setup

### Development Environment
1. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

2. Update configuration variables in both files
3. Install dependencies: `npm run install-deps`
4. Start development servers: `npm run dev`

### Production Environment

#### Backend Deployment
1. Set production environment variables:
   ```bash
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=your-production-mongodb-uri
   FRONTEND_URL=https://your-frontend-domain.com
   APP_URL=https://your-api-domain.com
   ```

2. Build and deploy using your preferred method:
   - Docker containerization
   - PM2 process manager
   - Cloud platform (Heroku, AWS, etc.)

#### Frontend Deployment
1. Set production environment variables:
   ```bash
   VITE_BACKEND_URL=https://your-api-domain.com
   ```

2. Build the application:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy the `dist` folder to your web server or CDN

## Security Considerations

1. Use HTTPS in production
2. Configure proper CORS settings
3. Set up rate limiting
4. Use environment variables for all secrets
5. Implement proper authentication if needed
6. Regular security updates

## Monitoring

1. Set up application logging
2. Monitor API response times
3. Track error rates
4. Database performance monitoring
5. Uptime monitoring

## Backup Strategy

1. Regular database backups
2. Application code backups
3. Environment configuration backups
4. Disaster recovery procedures
