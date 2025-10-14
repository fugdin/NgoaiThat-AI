module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error('[API ERROR]', err.stack || err);
  if (res.headersSent) return;
  res.status(500).json({ ok: false, message: 'Internal Server Error' });
};
