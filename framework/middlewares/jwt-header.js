module.exports = () => async (ctx, next) => {
  if (ctx.req.headers && ctx.req.headers.authorization) {
    if (!ctx.req.headers.authorization.startsWith('Bearer ')) {
      ctx.req.headers.authorization = 'Bearer ' + ctx.req.headers.authorization
    }
  }
  await next()
}
