import Url from '../models/Url.js';
import { generateShortUrl } from '../utils/generateShortUrl.js';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import geoip from 'geoip-lite';
import EvaluationLogger from '../../logging-middleware/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize evaluation logger
const logger = new EvaluationLogger(process.env.AUTH_TOKEN || 'fallback-token');

// Helper function to validate URL format
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Helper function to get location from IP using geoip-lite
const getLocationFromIP = (ip) => {
  try {
    // Handle localhost and private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'India',
        region: 'Maharashtra', 
        city: 'Mumbai'
      };
    }
    
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        country: geo.country || 'Unknown',
        region: geo.region || 'Unknown',
        city: geo.city || 'Unknown'
      };
    }
    
    // Fallback for unknown IPs
    return {
      country: 'India',
      region: 'Maharashtra',
      city: 'Mumbai'
    };
  } catch (error) {
    logger.error('backend', 'handler', `Geolocation lookup failed: ${error.message}`);
    return {
      country: 'Unknown',
      region: 'Unknown', 
      city: 'Unknown'
    };
  }
};

// Create Short URL - POST /shorturls
export const createShortUrl = async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;
    
    logger.info('backend', 'controller', 'Short URL creation request received');
    logger.debug('backend', 'route', 'POST /shorturls endpoint hit');
    
    // Validate required URL
    if (!url) {
      logger.warn('backend', 'handler', 'URL creation failed - missing URL parameter');
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL format
    if (!isValidUrl(url)) {
      logger.error('backend', 'handler', `Invalid URL format provided: ${url}`);
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Validate validity is a positive integer
    if (!Number.isInteger(validity) || validity <= 0) {
      logger.warn('URL creation failed - invalid validity', { validity });
      return res.status(400).json({ error: 'Validity must be a positive integer representing minutes' });
    }
    
    let finalShortcode;
    
    // Check if custom shortcode is provided
    if (shortcode) {
      // Validate custom shortcode (alphanumeric, reasonable length)
      if (!/^[a-zA-Z0-9]{3,20}$/.test(shortcode)) {
        logger.warn('URL creation failed - invalid shortcode format', { shortcode });
        return res.status(400).json({ error: 'Shortcode must be alphanumeric and between 3-20 characters' });
      }
      
      // Check if shortcode already exists
      const existingUrl = await Url.findOne({ shortcode });
      if (existingUrl) {
        logger.warn('URL creation failed - shortcode collision', { shortcode });
        return res.status(409).json({ error: 'Shortcode already exists. Please choose a different one.' });
      }
      
      finalShortcode = shortcode;
    } else {
      // Generate unique shortcode
      let attempts = 0;
      do {
        finalShortcode = generateShortUrl();
        attempts++;
        if (attempts > 10) {
          logger.error('Failed to generate unique shortcode after 10 attempts');
          return res.status(500).json({ error: 'Failed to generate unique shortcode' });
        }
      } while (await Url.findOne({ shortcode: finalShortcode }));
    }
    
    // Calculate expiry date
    const expiryDate = new Date(Date.now() + validity * 60 * 1000);
    
    // Generate full short URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BACKEND_URL || process.env.APP_URL
      : `http://localhost:${process.env.PORT || 5001}`;
    
    const fullShortUrl = `${baseUrl}/${finalShortcode}`;
    
    // Create URL object
    const urlData = { 
      originalUrl: url, 
      shortcode: finalShortcode,
      shortUrl: fullShortUrl,
      validity,
      expiryDate
    };
    
    const urlDoc = new Url(urlData);
    await urlDoc.save();
    
    logger.info('Short URL created successfully', { 
      shortcode: finalShortcode, 
      originalUrl: url,
      expiryDate: expiryDate.toISOString()
    });

    res.status(201).json({
      shortLink: fullShortUrl,
      expiry: expiryDate.toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating short URL', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Short URL Statistics - GET /shorturls/:shortcode
export const getShortUrlStats = async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    logger.info('backend', 'controller', `Statistics request for shortcode: ${shortcode}`);
    
    const url = await Url.findOne({ shortcode });
    
    if (!url) {
      logger.warn('backend', 'handler', `Statistics request failed - shortcode not found: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    const stats = {
      originalUrl: url.originalUrl,
      shortcode: url.shortcode,
      createdAt: url.createdAt.toISOString(),
      expiresAt: url.expiryDate.toISOString(),
      totalClicks: url.clicks,
      clickLogs: url.clickDetails.map(click => ({
        timestamp: click.timestamp.toISOString(),
        referrer: click.referrer || 'Direct',
        location: `${click.location.city}, ${click.location.region}, ${click.location.country}`
      }))
    };
    
    logger.info('backend', 'controller', `Statistics retrieved successfully for ${shortcode}: ${stats.totalClicks} clicks`);
    
    res.json(stats);
    
  } catch (error) {
    logger.fatal('backend', 'controller', `Error retrieving statistics: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Redirect URL - GET /:shortcode
export const redirectUrl = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
    
    logger.info('backend', 'route', `Redirect request for shortcode: ${shortcode} from IP: ${clientIP}`);
    
    const url = await Url.findOne({ shortcode });
    
    if (!url) {
      logger.warn('backend', 'handler', `Redirect failed - shortcode not found: ${shortcode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Check if URL has expired using MongoDB TTL or manual check
    if (new Date() > url.expiryDate) {
      logger.warn('backend', 'handler', `Redirect failed - URL expired: ${shortcode} expired at ${url.expiryDate}`);
      url.isExpired = true;
      await url.save();
      return res.status(410).json({ error: 'This short URL has expired' });
    }

    // Check if URL is active
    if (!url.isActive) {
      logger.warn('backend', 'handler', `Redirect failed - URL disabled: ${shortcode}`);
      return res.status(403).json({ error: 'This link has been disabled' });
    }

    // Check if URL is password protected
    if (url.isPasswordProtected) {
      logger.info('backend', 'handler', `Password protected URL accessed: ${shortcode}`);
      // Serve the password prompt HTML page
      return res.sendFile(path.join(__dirname, '../public/password-prompt.html'));
    }

    // Get geographical location
    const location = getLocationFromIP(clientIP);
    
    // Record click details
    const clickData = {
      timestamp: new Date(),
      referrer: req.get('Referrer') || req.get('Referer') || 'Direct',
      userAgent: req.get('User-Agent') || '',
      ip: clientIP,
      location: location
    };

    // Increment clicks and add click details
    url.clicks += 1;
    url.clickDetails.push(clickData);
    await url.save();

    logger.info('backend', 'controller', `Successful redirect: ${shortcode} -> ${url.originalUrl} (Total clicks: ${url.clicks}, Location: ${location.city}, ${location.country})`);

    res.redirect(url.originalUrl);
  } catch (error) {
    logger.fatal('backend', 'route', `Error during URL redirect: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Legacy functions for backward compatibility
export const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, password } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const shortUrl = generateShortUrl();
    
    // Create URL object with password protection if password is provided
    const urlData = { 
      originalUrl, 
      shortcode: shortUrl,
      shortUrl: `${process.env.NODE_ENV === 'production' 
        ? process.env.BACKEND_URL || process.env.APP_URL
        : `http://localhost:${process.env.PORT || 5001}`}/${shortUrl}`,
      validity: 30,
      expiryDate: new Date(Date.now() + 30 * 60 * 1000),
      isPasswordProtected: !!password
    };
    
    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      urlData.password = await bcrypt.hash(password, saltRounds);
    }
    
    const url = new Url(urlData);
    await url.save();

    // Generate the full URL based on environment
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BACKEND_URL || process.env.APP_URL
      : `http://localhost:${process.env.PORT || 5001}`;
    
    res.json({
      originalUrl,
      shortUrl: `${baseUrl}/${shortUrl}`,
      id: url._id,
      isPasswordProtected: url.isPasswordProtected
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllUrls = async (req, res) => {
  try {
    // Return all URLs since no authentication is required
    const urls = await Url.find({})
      .select('-password') // Don't return password in the response
      .sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { shortUrl, password } = req.body;
    
    if (!shortUrl || !password) {
      return res.status(400).json({ error: 'Short URL and password are required' });
    }
    
    const url = await Url.findOne({ shortUrl });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if URL is active
    if (!url.isActive) {
      return res.status(403).json({ error: 'This link has been disabled' });
    }
    
    if (!url.isPasswordProtected) {
      return res.status(400).json({ error: 'URL is not password protected' });
    }
    
    // Check if password matches
    const isValidPassword = await bcrypt.compare(password, url.password);
    
    if (!isValidPassword) {
      // Increment password attempts
      url.passwordAttempts += 1;
      
      // Auto-disable link after 5 failed attempts
      if (url.passwordAttempts >= 5) {
        url.isActive = false;
      }
      
      await url.save();
      
      return res.status(401).json({ 
        error: 'Invalid password',
        attempts: url.passwordAttempts,
        disabled: url.passwordAttempts >= 5
      });
    }
    
    // Password is correct, increment clicks and return original URL
    url.clicks += 1;
    await url.save();
    
    res.json({ 
      originalUrl: url.originalUrl,
      success: true 
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const toggleUrlStatus = async (req, res) => {
  try {
    const { urlId } = req.params;
    
    const url = await Url.findOne({ _id: urlId });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    // Toggle active status
    url.isActive = !url.isActive;
    
    // If re-enabling, reset password attempts
    if (url.isActive) {
      url.passwordAttempts = 0;
    }
    
    await url.save();
    
    res.json({
      success: true,
      isActive: url.isActive,
      passwordAttempts: url.passwordAttempts,
      message: url.isActive ? 'Link enabled' : 'Link disabled'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPasswordAttempts = async (req, res) => {
  try {
    const { urlId } = req.params;
    
    const url = await Url.findOne({ _id: urlId });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    url.passwordAttempts = 0;
    await url.save();
    
    res.json({
      success: true,
      passwordAttempts: url.passwordAttempts,
      message: 'Password attempts reset'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
