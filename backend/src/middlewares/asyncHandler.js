module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ ok: false, message: err.message });
  });
};
