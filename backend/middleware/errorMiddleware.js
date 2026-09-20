function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  
  // Log internal error server-side for diagnostics
  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - ${err.message}`);

  // Mask sensitive database or internal stack traces from clients
  let clientMessage = err.message || 'An unexpected error occurred. Please try again later.';

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    clientMessage = err.message || 'An unexpected server error occurred. Our technical staff has been notified.';
  }

  // Handle common database error patterns
  if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('UNIQUE constraint failed')) {
    clientMessage = 'A duplicate record already exists with the provided information.';
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    error: err.message
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
