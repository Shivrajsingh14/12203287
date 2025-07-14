export interface AuthConfig {
  token_type: string;
  access_token: string;
  expires_in: number;
  email: string;
  name: string;
  rollNo: string;
  clientID: string;
  accessCode: string;
}

export class EvaluationAuth {
  private static instance: EvaluationAuth;
  private authConfig: AuthConfig;

  private constructor() {
    this.authConfig = {
      token_type: "Bearer",
      access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaGl2cmFqcHJvaGFja2VyMTRAZ21haWwuY29tIiwiZXhwIjoxNzUyNDc2NDkwLCJpYXQiOjE3NTI0NzU1OTAsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJhNDJkYWE5My0yYmQwLTRlMWEtOTgyNi03NmFmMTdlYWMwZTYiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzaGl2cmFqIHNpbmdoIiwic3ViIjoiODNkZmEyYjAtZjJiYy00MmJhLWE2NzUtYTliNDYxMWFjMGQzIn0sImVtYWlsIjoic2hpdnJhanByb2hhY2tlcjE0QGdtYWlsLmNvbSIsIm5hbWUiOiJzaGl2cmFqIHNpbmdoIiwicm9sbE5vIjoiMTIyMDMyODciLCJhY2Nlc3NDb2RlIjoiQ1p5cFFLIiwiY2xpZW50SUQiOiI4M2RmYTJiMC1mMmJjLTQyYmEtYTY3NS1hOWI0NjExYWMwZDMiLCJjbGllbnRTZWNyZXQiOiJjc2pmWGtQZW5EQVRHRUZnIn0.iXlWn6yWkOJ1DpUXE88bhNMqjDrGWRYkj-6ewPPpveU",
      expires_in: 1752476490,
      email: "shivrajprohacker14@gmail.com",
      name: "shivraj singh",
      rollNo: "12203287",
      clientID: "83dfa2b0-f2bc-42ba-a675-a9b4611ac0d3",
      accessCode: "CZypQK"
    };
  }

  public static getInstance(): EvaluationAuth {
    if (!EvaluationAuth.instance) {
      EvaluationAuth.instance = new EvaluationAuth();
    }
    return EvaluationAuth.instance;
  }

  public getAuthToken(): string {
    return this.authConfig.access_token;
  }

  public getAuthHeader(): string {
    return `${this.authConfig.token_type} ${this.authConfig.access_token}`;
  }

  public isTokenExpired(): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime > this.authConfig.expires_in;
  }

  public getTimeUntilExpiry(): number {
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, this.authConfig.expires_in - currentTime);
  }

  public getUserInfo() {
    return {
      email: this.authConfig.email,
      name: this.authConfig.name,
      rollNo: this.authConfig.rollNo,
      clientID: this.authConfig.clientID,
      accessCode: this.authConfig.accessCode
    };
  }

  public getAuthConfig(): AuthConfig {
    return { ...this.authConfig };
  }
}

export default EvaluationAuth.getInstance();