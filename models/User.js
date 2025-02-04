const mongoose = require("mongoose");
// require("dotenv").config();

// // Connect to MongoDB
// // const MONGO_URI = 'mongodb://0.0.0.0:27017/bookstore';
// const MONGO_URI = process.env.MONGO_URI;

// mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// mongoose.connection.on("connected", () => {
//   console.log("Mongoose connected to:", MONGO_URI);
// });

// mongoose.connection.on("error", (err) => {
//   console.error("Mongoose connection error:", err);
// });

// mongoose.connection.on("disconnected", () => {
//   console.log("Mongoose disconnected");
// });



// Define User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ["active", "deactivated"], default: "active" },
});

// Create User model
const User = mongoose.model("user", UserSchema);

module.exports = User;
