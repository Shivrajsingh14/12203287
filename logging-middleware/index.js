import axios from 'axios';

class EvaluationLogger {
  constructor(authToken) {
    this.authToken = authToken;
    this.baseURL = 'http://20.244.56.144/evaluation-service';
  }

  async Log(stack, level, pkg, message) {
    try {
      const logData = {
        stack,
        level,
        package: pkg,
        message,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(
        `${this.baseURL}/logs`,
        logData,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(`[${level.toUpperCase()}] [${stack}:${pkg}] ${message}`);
      }

      return response.data;
    } catch (error) {
      console.error(`[LOGGER ERROR] Failed to send log: ${error.message}`);
      console.log(`[${level.toUpperCase()}] [${stack}:${pkg}] ${message}`);
      
      if (typeof window !== 'undefined') {
        // Browser environment
        const failedLogs = JSON.parse(localStorage.getItem('failedLogs') || '[]');
        failedLogs.push({ stack, level, package: pkg, message, timestamp: new Date().toISOString() });
        localStorage.setItem('failedLogs', JSON.stringify(failedLogs.slice(-50))); // Keep last 50
      }
    }
  }

  /**
   * Convenience methods for different log levels
   */
  debug(stack, pkg, message) {
    return this.Log(stack, 'debug', pkg, message);
  }

  info(stack, pkg, message) {
    return this.Log(stack, 'info', pkg, message);
  }

  warn(stack, pkg, message) {
    return this.Log(stack, 'warn', pkg, message);
  }

  error(stack, pkg, message) {
    return this.Log(stack, 'error', pkg, message);
  }

  fatal(stack, pkg, message) {
    return this.Log(stack, 'fatal', pkg, message);
  }

  /**
   * Generate auth token using provided credentials
   */
  static async generateAuthToken(credentials) {
    try {
      const response = await axios.post(
        'http://20.244.56.144/evaluation-service/auth',
        {
          email: credentials.email,
          name: credentials.name,
          rollNo: credentials.rollNo,
          accessCode: credentials.accessCode,
          clientID: credentials.clientID,
          clientSecret: credentials.clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.access_token || response.data.token;
    } catch (error) {
      console.error('Failed to generate auth token:', error.message);
      throw error;
    }
  }
}

// Export for both CommonJS and ES modules
export default EvaluationLogger;
export { EvaluationLogger };
