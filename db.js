const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://0.0.0.0:27017/bookstore";

const connectDB = async () => {
  await mongoose.connect(MONGO_URI);

  console.log("Connected to MongoDB");

  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to:", MONGO_URI);
  });

  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
    // Optionally, you can throw the error to let the global error handler manage it
    throw err;
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
  });
};

module.exports = connectDB;
