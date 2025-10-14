module.exports = function respond(req, res, next) {
  res.ok = (data = null, message = 'OK', status = 200) =>
    res.status(status).json({ ok: true, data, message });

  res.err = (message = 'Error', status = 500, extra = null) =>
    res.status(status).json({ ok: false, message, ...(extra ? { extra } : {}) });

  next();
};
