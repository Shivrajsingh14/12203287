import axios, { AxiosInstance } from 'axios';

interface LogEntry {
  timestamp: string;
  level: string;
  package: string;
  component: string;
  message: string;
  authToken: string;
  userAgent: string;
  url: string;
}

class FrontendEvaluationLogger {
  private apiUrl: string;
  private authToken: string;
  private packageName: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.apiUrl = import.meta.env.VITE_EVALUATION_SERVER_URL || 'http://20.244.56.144/evaluation-service/logs';
    this.authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaGl2cmFqcHJvaGFja2VyMTRAZ21haWwuY29tIiwiZXhwIjoxNzUyNDc2NDkwLCJpYXQiOjE3NTI0NzU1OTAsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJhNDJkYWE5My0yYmQwLTRlMWEtOTgyNi03NmFmMTdlYWMwZTYiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzaGl2cmFqIHNpbmdoIiwic3ViIjoiODNkZmEyYjAtZjJiYy00MmJhLWE2NzUtYTliNDYxMWFjMGQzIn0sImVtYWlsIjoic2hpdnJhanByb2hhY2tlcjE0QGdtYWlsLmNvbSIsIm5hbWUiOiJzaGl2cmFqIHNpbmdoIiwicm9sbE5vIjoiMTIyMDMyODciLCJhY2Nlc3NDb2RlIjoiQ1p5cFFLIiwiY2xpZW50SUQiOiI4M2RmYTJiMC1mMmJjLTQyYmEtYTY3NS1hOWI0NjExYWMwZDMiLCJjbGllbnRTZWNyZXQiOiJjc2pmWGtQZW5EQVRHRUZnIn0.iXlWn6yWkOJ1DpUXE88bhNMqjDrGWRYkj-6ewPPpveU';
    this.packageName = 'frontend';
    
    // Create axios instance with default config
    this.axiosInstance = axios.create({
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    });
  }

  generateAuthToken(): string {
    return this.authToken + '-' + Date.now();
  }

  async log(level: string, component: string, message: string): Promise<void> {
    try {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        package: this.packageName,
        component: component,
        message: message,
        authToken: this.generateAuthToken(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      if (import.meta.env.DEV) {
        console.log(`[${level.toUpperCase()}] [${this.packageName}:${component}] ${message}`);
      }

      await this.axiosInstance.post(this.apiUrl, logEntry);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Evaluation logging failed:', errorMessage);
      console.log(`[${level.toUpperCase()}] [${this.packageName}:${component}] ${message}`);
    }
  }

  async debug(component: string, message: string): Promise<void> {
    return this.log('debug', component, message);
  }

  async info(component: string, message: string): Promise<void> {
    return this.log('info', component, message);
  }

  async warn(component: string, message: string): Promise<void> {
    return this.log('warn', component, message);
  }

  async error(component: string, message: string): Promise<void> {
    return this.log('error', component, message);
  }

  async fatal(component: string, message: string): Promise<void> {
    return this.log('fatal', component, message);
  }

  async logUserAction(action: string, details: Record<string, any> = {}): Promise<void> {
    return this.info('user-interaction', `User action: ${action} ${JSON.stringify(details)}`);
  }

  async logAPICall(method: string, endpoint: string, status: number): Promise<void> {
    return this.debug('api-client', `${method} ${endpoint} -> ${status}`);
  }

  async logComponentEvent(componentName: string, event: string, data: Record<string, any> = {}): Promise<void> {
    return this.debug('component', `${componentName} ${event} ${JSON.stringify(data)}`);
  }
}

const logger = new FrontendEvaluationLogger();
export default logger;
