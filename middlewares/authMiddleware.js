const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (ctx, next) => {
  // const authHeader = ctx.headers["authorization"]; // ctx.headers.authorization?
  // if (!authHeader) {
  //   throw new AppError("Authorization token missing", 401);
  // }
  // const token = authHeader.split(" ")[1];

  // Retrieve the token from the HTTP-only cookie
  const token = ctx.cookies.get("auth_token");

  if (!token) {
    throw new AppError("Authorization token missing", 401);
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  // Check if the user exists in the database and is not deactivated
  const user = await User.findById(decoded.id);
  if (!user || user.status === "deactivated") {
    // ctx.throw(403, "Account is deactivated or user does not exist");
    throw new AppError("Account is deactivated or user does not exist", 403);
  }
  // Attach the user to the context state for downstream middlewares or routes
  ctx.state.user = user;
  await next(); // next middleware function in protected.js
};

module.exports = authMiddleware;
