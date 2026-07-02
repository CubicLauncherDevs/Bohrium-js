export class RateLimitError extends Error {
  constructor(provider) {
    super(`Rate limited by ${provider}`);
    this.name = 'RateLimitError';
    this.status = 429;
  }
}

export class NotFoundError extends Error {
  constructor(msg = 'Not found') {
    super(msg);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class ApiError extends Error {
  constructor(provider, status) {
    super(`${provider} API error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

const ERRORS = { RateLimitError, NotFoundError, ApiError };
export default ERRORS;
