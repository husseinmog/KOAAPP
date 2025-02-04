const Router = require("koa-router");
const { User, Book } = require("../models");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/authMiddleware");
const router = new Router();

/****************************************************************************************/
/********************************Create a New Book***************************************/
router.post("/books", async (ctx) => {
  const { title, author, pages, genres, rating } = ctx.request.body;

  if (!title || !author) {
    throw new AppError("Title and Author are required fields", 400);
  }

  const newBook = new Book({
    title,
    author,
    pages,
    genres: genres || [], // Ensure genres is an array or empty
    rating,
  });

  await newBook.save();

  ctx.status = 201;
  ctx.body = { message: "Book created successfully", book: newBook };
});

/****************************************************************************************/
/***********************************Get All Books****************************************/
router.get("/books", async (ctx) => {
  const books = await Book.find();
  ctx.status = 200;
  ctx.body = { books };
});

/****************************************************************************************/
/**********************************Get a Book by ID**************************************/
router.get("/books/:bookId", async (ctx) => {
  const { bookId } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new AppError("Invalid Book ID", 400);
  }

  const book = await Book.findById(bookId);
  if (!book) {
    throw new AppError("Book not found", 404);
  }

  ctx.status = 200;
  ctx.body = { book };
});

/****************************************************************************************/
/******************************Update a Field in a Book**********************************/
router.put("/books/:bookId", async (ctx) => {
  const { bookId } = ctx.params;
  const { title, author, pages, genres, rating } = ctx.request.body;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new AppError("Invalid Book ID", 400);
  }

  const updatedBook = await Book.findByIdAndUpdate(
    bookId,
    {
      title,
      author,
      pages,
      genres: Array.isArray(genres) ? genres : [genres], // Ensure genres is always an array
      rating,
    },
    { new: true, runValidators: true }
  );

  if (!updatedBook) {
    throw new AppError("Book not found", 404);
  }

  ctx.status = 200;
  ctx.body = { message: "Book updated successfully", book: updatedBook };
});

/****************************************************************************************/
/***********************************Delete a Book****************************************/
router.delete("/books/:bookId", authMiddleware, async (ctx) => {
  const { bookId } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new AppError("Invalid Book ID", 400);
  }

  const deletedBook = await Book.findByIdAndDelete(bookId);

  if (!deletedBook) {
    throw new AppError("Book not found", 404);
  }

  ctx.status = 200;
  ctx.body = { message: "Book deleted successfully", book: deletedBook };
});

/****************************************************************************************/
/******************************Add a comment to a book***********************************/
router.post("/books/:bookId/comments", authMiddleware, async (ctx) => {
  const { bookId } = ctx.params; // Book ID
  const { comment } = ctx.request.body; // comment text

  // Ensure the user exists
  const user_Id = ctx.state.user._id;
  // const userr = await User.findById(user_Id);

  if (!comment) {
    throw new AppError("Comment is required", 404);
  }

  // Find the book
  const book = await Book.findById(bookId);
  if (!book) {
    throw new AppError("Book not found", 404);
  }

  // Add the comment
  book.comments.push({ comment, user_Id });
  await book.save();

  ctx.status = 201;
  ctx.body = { message: "Comment added successfully", book };
});

/****************************************************************************************/
/**********************Delete a specific user's comment from a book**********************/
//
router.delete(
  "/books/:bookId/comments/:commentId",
  authMiddleware,
  async (ctx) => {
    const { bookId, commentId } = ctx.params; //http://localhost:3000/books/6788e71d1a15b2a145f32f37/comments/6792672cf67cfa3484aaa2c8
    // const { user_Id } = ctx.request.body;//{"user_Id": "678f498d28f78edfebb01cae"}
    const user_Id = ctx.state.user._id;

    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError("Book not found", 404);
    }

    const comment = book.comments.find(
      (comment) => comment._id.toString() === commentId
    );
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }
    if (comment.user_Id.toString() != user_Id.toString()) {
      throw new AppError("You can only delete your own comments", 403);
    }

    // Remove the comment
    book.comments = book.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );

    await book.save();

    ctx.status = 200;
    ctx.body = { message: "Comment deleted successfully" };
  }
);

/***********************************************************************************************/
/****************************Update a specific user's comment***********************************/
router.put(
  "/books/:bookId/comments/:commentId",
  authMiddleware,
  async (ctx) => {
    const { bookId, commentId } = ctx.params; // Extract bookId and commentId from the URL
    const { comment } = ctx.request.body; // Extract new comment text from the request body

    const user_Id = ctx.state.user._id;

    if (!comment || typeof comment !== "string") {
      throw new AppError("Comment is required and must be a string", 400);
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError("Book not found", 404);
    }

    // Find the comment
    const existingComment = book.comments.id(commentId);
    if (!existingComment) {
      throw new AppError("Comment not found", 404);
    }

    // Ensure the user is the owner of the comment
    if (existingComment.user_Id.toString() !== user_Id.toString()) {
      throw new AppError("You can only update your own comments", 403);
    }

    // Update the comment
    existingComment.comment = comment;
    await book.save(); // Save the updated book

    ctx.status = 200;
    ctx.body = {
      message: "Comment updated successfully",
      updatedComment: existingComment,
    };
  }
);

module.exports = router;
