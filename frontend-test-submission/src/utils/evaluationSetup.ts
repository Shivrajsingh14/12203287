import evaluationAuth from '../services/evaluationAuth';
import logger from '../services/evaluationLogger';

export class EvaluationSetup {
  private static initialized = false;

  public static async initialize(): Promise<void> {
    if (EvaluationSetup.initialized) {
      return;
    }

    try {
      await logger.info('evaluation-setup', 'Initializing evaluation environment');
      
      const auth = evaluationAuth;
      const userInfo = auth.getUserInfo();
      
      await logger.info('evaluation-setup', `User authenticated: ${userInfo.name} (${userInfo.rollNo})`);
      
      if (auth.isTokenExpired()) {
        await logger.warn('evaluation-setup', 'Authentication token has expired');
      } else {
        const timeLeft = auth.getTimeUntilExpiry();
        await logger.info('evaluation-setup', `Token valid for ${Math.floor(timeLeft / 60)} minutes`);
      }

      EvaluationSetup.initialized = true;
      await logger.info('evaluation-setup', 'Evaluation environment initialized successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await logger.error('evaluation-setup', `Failed to initialize evaluation environment: ${errorMessage}`);
    }
  }

  public static async checkStatus(): Promise<void> {
    try {
      const auth = evaluationAuth;
      const userInfo = auth.getUserInfo();
      
      console.log('=== Evaluation Setup Status ===');
      console.log('User:', userInfo.name);
      console.log('Email:', userInfo.email);
      console.log('Roll Number:', userInfo.rollNo);
      console.log('Client ID:', userInfo.clientID);
      console.log('Access Code:', userInfo.accessCode);
      console.log('Token Expired:', auth.isTokenExpired());
      
      if (!auth.isTokenExpired()) {
        const timeLeft = auth.getTimeUntilExpiry();
        console.log('Time Until Expiry:', `${Math.floor(timeLeft / 60)} minutes`);
      }
      
      await logger.info('evaluation-setup', 'Status check completed');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Status check failed:', errorMessage);
      await logger.error('evaluation-setup', `Status check failed: ${errorMessage}`);
    }
  }

  public static async testLogging(): Promise<void> {
    try {
      console.log('=== Testing Evaluation Logging ===');
      
      await logger.debug('test', 'Debug message test');
      await logger.info('test', 'Info message test');
      await logger.warn('test', 'Warning message test');
      await logger.error('test', 'Error message test');
      
      await logger.logUserAction('test_action', { test: true, timestamp: Date.now() });
      await logger.logAPICall('GET', '/test-endpoint', 200);
      await logger.logComponentEvent('TestComponent', 'test_event', { data: 'test' });
      
      console.log('Logging test completed - check console and network tab');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Logging test failed:', errorMessage);
    }
  }

  public static getCurrentSetup() {
    const auth = evaluationAuth;
    return {
      userInfo: auth.getUserInfo(),
      authConfig: auth.getAuthConfig(),
      isExpired: auth.isTokenExpired(),
      timeUntilExpiry: auth.getTimeUntilExpiry()
    };
  }

  public static async logApplicationStart(): Promise<void> {
    await logger.info('application', 'URL Shortener application started');
    await logger.logUserAction('app_start', { 
      timestamp: Date.now(), 
      userAgent: navigator.userAgent,
      url: window.location.href 
    });
  }

  public static async logApplicationEnd(): Promise<void> {
    await logger.info('application', 'URL Shortener application ended');
    await logger.logUserAction('app_end', { timestamp: Date.now() });
  }
}

// Auto-initialize when the module is loaded
EvaluationSetup.initialize().catch(console.error);

// Make available globally for debugging
(window as any).EvaluationSetup = EvaluationSetup;

export default EvaluationSetup;