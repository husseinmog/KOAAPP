const Router = require("koa-router");
const authMiddleware = require("../middlewares/authMiddleware");

const router = new Router();

// router.get('/protected-route', authMiddleware, async (ctx) => {
//   ctx.body = { message: 'This is a protected route', user: ctx.state.user };
// });

// Example protected route
router.get("/profile", authMiddleware, async (ctx) => {
  ctx.status = 200;
  ctx.body = { message: "Access granted", user: ctx.state.user };
});

module.exports = router;
