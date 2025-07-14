import express from 'express';
import { 
  createShortUrl, 
  getShortUrlStats,
  redirectUrl,
  shortenUrl, 
  getAllUrls, 
  verifyPassword, 
  toggleUrlStatus, 
  resetPasswordAttempts 
} from '../controllers/urlController.js';
import EvaluationLogger from '../../logging-middleware/index.js';

const router = express.Router();

// Initialize evaluation logger
const logger = new EvaluationLogger(process.env.AUTH_TOKEN || 'fallback-token');

// New API endpoints as per specification
router.post('/shorturls', (req, res, next) => {
  logger.debug('backend', 'route', 'POST /shorturls route accessed');
  next();
}, createShortUrl);

router.get('/shorturls/:shortcode', (req, res, next) => {
  logger.debug('backend', 'route', `GET /shorturls/${req.params.shortcode} route accessed`);
  next();
}, getShortUrlStats);

// Legacy endpoints for backward compatibility
router.post('/shorten', shortenUrl);
router.get('/urls', getAllUrls);
router.post('/verify-password', verifyPassword);
router.put('/toggle/:urlId', toggleUrlStatus);
router.put('/reset-attempts/:urlId', resetPasswordAttempts);

// Redirect endpoint - should be last to catch shortcodes
router.get('/:shortcode', (req, res, next) => {
  logger.debug('backend', 'route', `GET /:shortcode route accessed for ${req.params.shortcode}`);
  next();
}, redirectUrl);

export default router; 