# Evaluation Logging Middleware

A reusable logging middleware package for Campus Hiring Evaluation that sends logs to the evaluation server.

## Installation

```bash
npm install
```

## Usage

### Initialize Logger

```javascript
import EvaluationLogger from './index.js';

// Option 1: With existing auth token
const logger = new EvaluationLogger('your-auth-token');

// Option 2: Generate auth token first
const credentials = {
  email: "your-college@email.com",
  name: "Your Full Name",
  rollNo: "22BCS12345",
  accessCode: "your-access-code",
  clientID: "your-client-id",
  clientSecret: "your-client-secret"
};

const authToken = await EvaluationLogger.generateAuthToken(credentials);
const logger = new EvaluationLogger(authToken);
```

### Logging Methods

```javascript
// Main logging method
logger.Log(stack, level, pkg, message);

// Convenience methods
logger.debug(stack, pkg, message);
logger.info(stack, pkg, message);
logger.warn(stack, pkg, message);
logger.error(stack, pkg, message);
logger.fatal(stack, pkg, message);
```

### Parameters

- **stack**: "backend" | "frontend"
- **level**: "debug" | "info" | "warn" | "error" | "fatal"
- **pkg**: "handler" | "route" | "controller" | "api" | "component" | etc.
- **message**: Descriptive message

### Examples

```javascript
// Backend usage
logger.info("backend", "controller", "Short URL created successfully");
logger.debug("backend", "route", "POST /shorturls endpoint hit");
logger.error("backend", "handler", "Invalid URL format provided");

// Frontend usage
logger.info("frontend", "component", "Form submitted successfully");
logger.warn("frontend", "api", "API response delay detected");
```

## Features

- ✅ Works in both Node.js (backend) and Browser (frontend)
- ✅ Automatic retry logic for failed requests
- ✅ Fallback console logging for development
- ✅ Local storage backup for failed logs (browser)
- ✅ Built-in auth token generation
- ✅ TypeScript support ready

## Error Handling

The middleware includes robust error handling:
- Falls back to console logging if evaluation server is unreachable
- Stores failed logs locally for potential retry
- Doesn't break application flow on logging failures
