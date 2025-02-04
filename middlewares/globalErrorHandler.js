const globalErrorHandler = async (ctx, next) => {
    try {
      await next(); // Pass control to the next middleware or route
    } catch (err) {
      console.error("Global Error:", err);
  
      // Set the HTTP status code and response body
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
        status: ctx.status,
        message: err.message,
        errors: err.errors || null,
      };
  
      // Optionally emit the error for logging or monitoring purposes
      ctx.app.emit("error", err, ctx);
    }
  };
  
  module.exports = globalErrorHandler;
  