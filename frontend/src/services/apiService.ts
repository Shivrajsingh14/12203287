import axios, { AxiosResponse } from 'axios';
import logger from './evaluationLogger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    logger.debug('api-client', `Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('api-client', `Request error: ${error.message}`);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    logger.debug('api-client', `${response.config.method?.toUpperCase()} ${response.config.url} -> ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status || 'No response';
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'unknown-endpoint';
    logger.error('api-client', `${method} ${url} -> ${status}: ${error.message}`);
    return Promise.reject(error);
  }
);

// API service interfaces
export interface CreateUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface CreateUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface UrlStats {
  originalUrl: string;
  shortcode: string;
  createdAt: string;
  expiresAt: string;
  totalClicks: number;
  clickLogs: ClickLog[];
}

export interface ClickLog {
  timestamp: string;
  referrer: string;
  location: string;
}

export interface AllUrlsResponse {
  _id: string;
  originalUrl: string;
  shortcode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  expiryDate: string;
  isActive: boolean;
  isPasswordProtected: boolean;
  clickDetails: any[];
}

class ApiService {
  // Create a short URL
  async createShortUrl(data: CreateUrlRequest): Promise<CreateUrlResponse> {
    try {
      logger.info('api-service', `Creating short URL for: ${data.url}`);
      
      const response: AxiosResponse<CreateUrlResponse> = await apiClient.post('/shorturls', data);
      
      logger.info('api-service', `Short URL created successfully: ${response.data.shortLink}`);
      return response.data;
    } catch (error: any) {
      logger.error('api-service', `Failed to create short URL: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to create short URL');
    }
  }

  // Get URL statistics
  async getUrlStats(shortcode: string): Promise<UrlStats> {
    try {
      logger.info('api-service', `Fetching statistics for shortcode: ${shortcode}`);
      
      const response: AxiosResponse<UrlStats> = await apiClient.get(`/shorturls/${shortcode}`);
      
      logger.info('api-service', `Statistics retrieved for ${shortcode}: ${response.data.totalClicks} clicks`);
      return response.data;
    } catch (error: any) {
      logger.error('api-service', `Failed to fetch URL statistics: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to fetch URL statistics');
    }
  }

  // Get all URLs (legacy endpoint)
  async getAllUrls(): Promise<AllUrlsResponse[]> {
    try {
      logger.info('api-service', 'Fetching all URLs');
      
      const response: AxiosResponse<AllUrlsResponse[]> = await apiClient.get('/urls');
      
      logger.info('api-service', `Retrieved ${response.data.length} URLs`);
      return response.data;
    } catch (error: any) {
      logger.error('api-service', `Failed to fetch all URLs: ${error.response?.data?.error || error.message}`);
      throw new Error(error.response?.data?.error || 'Failed to fetch URLs');
    }
  }

  // Redirect to short URL (for frontend testing)
  getRedirectUrl(shortcode: string): string {
    const redirectUrl = `${API_BASE_URL}/${shortcode}`;
    logger.debug('api-service', `Generated redirect URL: ${redirectUrl}`);
    return redirectUrl;
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      logger.info('api-service', 'Testing API connection');
      
      // Try to fetch a non-existent URL to test if server is responding
      await apiClient.get('/shorturls/test-connection-123');
      return true;
    } catch (error: any) {
      // We expect a 404, which means the server is responding
      if (error.response?.status === 404) {
        logger.info('api-service', 'API connection successful');
        return true;
      }
      
      logger.error('api-service', `API connection failed: ${error.message}`);
      return false;
    }
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
