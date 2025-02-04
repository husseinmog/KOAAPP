require("dotenv").config();
const Router = require("koa-router");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const authMiddleware = require("../middlewares/authMiddleware");
const sendEmail = require("../customerIO");

const router = new Router();
const JWT_SECRET = process.env.JWT_SECRET;

/****************************************************************************************/
/************************************Customer IO**************************************/
router.post("/submit", authMiddleware, async (ctx) => {
  const { name, subject, message } = ctx.request.body;

  const user = ctx.state.user;
  if (!user) {
    throw new AppError("User is Invalid", 400);
  }

  if (!subject || !message) {
    throw new AppError("subject and message are required", 400);
  }

  try {
    await sendEmail(
      user.email,
      "Thank you for Ordering from MOG Store!",
      `<h1>Hello ${name},</h1><p>We received your message: ${message}</p>`
    );

    ctx.status = 200;
    ctx.body = { message: "Email sent successfully" };
  } catch (err) {
    console.log(err);
    throw new AppError("Failed to send email", 500);
  }
});

/****************************************************************************************/
/************************************Register User**************************************/
router.post("/register", async (ctx) => {
  const { email, password /*, status*/ } = ctx.request.body;

  if (!email || !password) {
    // ctx.status = 400;
    // ctx.body = { error: "All fields are required" };
    // return;
    throw new AppError("All fields are required", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword,
    status: "active",
  });
  await newUser.save();

  ctx.status = 201;
  ctx.body = { message: "User registered successfully" };
});

/****************************************************************************************/
/*************************************Login User*****************************************/
router.post("/login", async (ctx) => {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  // Set the token in an HTTP-only cookie
  ctx.cookies.set("auth_token", token, {
    httpOnly: true, // Prevent access via JavaScript
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "strict", // Protect against CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  });

  // Respond with a success message
  ctx.status = 200;
  ctx.body = { message: "Login successful" /*, token*/ };
});

/****************************************************************************************/
/************************************Logout User*****************************************/
router.post("/logout", async (ctx) => {
  ctx.cookies.set("auth_token", "", {
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.isProduction,
    sameSite: "strict",
    maxAge: new Date(Date.now() - 1000), // Expire immediately by setting it to the past
  });

  ctx.status = 200;
  ctx.body = { message: "Logged out successfully" };
});

/****************************************************************************************/
/********************************Update Password*****************************************/
router.put("/update-password", authMiddleware, async (ctx) => {
  const { currentPassword, newPassword } = ctx.request.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Both current and new password are required", 400);
  }

  const user = ctx.state.user;

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check if the current password matches
  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new AppError("Incorrect current password", 401);
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError(
      "New password cannot be the same as the current password",
      401
    );
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  user.password = hashedPassword;
  await user.save();

  ctx.status = 200;
  ctx.body = { message: "Password updated successfully" };
});

/*************************************************************************************************/
/********************************Activate/Deactivate Account**************************************/
router.put("/deactivate-account", authMiddleware, async (ctx) => {
  // const { status } = ctx.request.body;
  const user = ctx.state.user;
  if (user.status === "deactivated") {
    throw new AppError("Account is already deactivated", 400);
  }
  user.status = "deactivated";
  await user.save();

  ctx.status = 200;
  ctx.body = { message: `Account deactivated successfully` };
});

module.exports = router;
