require("dotenv").config();
const Koa = require("koa");
// const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const {userRoutes, bookRoutes} = require("./routes");
const protectedRoutes = require("./routes/protected");
const connectDB = require("./db");
const app = new Koa();
// const router = new Router();

// Use global error handler
app.use(globalErrorHandler);
// Body parser middleware
app.use(bodyParser());

// Connect to MongoDB
connectDB();

// Routes
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(bookRoutes.routes()).use(bookRoutes.allowedMethods());
app.use(protectedRoutes.routes()).use(protectedRoutes.allowedMethods());

// app.use(router.routes());
// app.use(router.allowedMethods());
// Log errors
app.on("error", (err, ctx) => {
  console.error("Error:", err.message);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
