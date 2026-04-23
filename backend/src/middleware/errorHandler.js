// Centralized error handling

export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    if (detail !== undefined) this.detail = detail;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // Already sent — delegate to default handler
  if (res.headersSent) return _next(err);

  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let detail = err.detail;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    detail = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === '_id') {
    status = 400;
    message = 'Invalid id format';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value';
    detail = err.keyValue;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  }

  // Multer file size
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File exceeds size limit';
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  const body = { error: message };
  if (detail !== undefined) body.detail = detail;
  if (process.env.NODE_ENV === 'development' && status >= 500) {
    body.stack = err.stack;
  }
  res.status(status).json(body);
}
