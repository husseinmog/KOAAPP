// models/Book.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
user_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
comment: { type: String, required: [true, "Comment is required"] },
timestamp: { type: Date, default: Date.now },
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  pages: { type: Number, required: true },
  genres: { type: [String], default: [] },
  // genres: Array.isArray(genres) ? genres : [genres],//for single values
  rating: { type: Number },
  comments: [commentSchema],
});

module.exports = mongoose.model("Book", bookSchema);
