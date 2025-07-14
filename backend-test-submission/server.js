import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import urlRoutes from './routes/urlRoutes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/logger.js';
import EvaluationLogger from '../logging-middleware/index.js';

dotenv.config();

const logger = new EvaluationLogger(process.env.AUTH_TOKEN || 'fallback-token');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(requestLogger);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
}));

app.use(express.json());

app.use('/', urlRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info('backend', 'server', `URL Shortener service started on port ${PORT}`);
});