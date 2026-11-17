// apps/api/src/routes/stubHelper.js
// Standard 501 NOT_IMPLEMENTED envelope generator per §6.1

export function stub(routeName) {
  return (req, res) => {
    res.status(501).json({
      error: {
        code: "NOT_IMPLEMENTED",
        message: `${req.method} ${req.originalUrl || req.url} is not implemented yet`,
        details: {
          route: routeName,
          method: req.method,
          path: req.originalUrl || req.url
        }
      }
    });
  };
}
