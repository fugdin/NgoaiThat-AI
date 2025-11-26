const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../db");

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ ok: false, message: "Thiếu token (Bearer ...)" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.userId) {
      return res.status(401).json({ ok: false, message: "Token không hợp lệ" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("Id", sql.BigInt, Number(decoded.userId))
      .query("SELECT Id, Email, Role FROM Users WHERE Id = @Id");

    const user = result.recordset[0];
    if (!user) {
      return res
        .status(401)
        .json({ ok: false, message: "Tài khoản không còn tồn tại" });
    }

    req.user = {
      ...decoded,
      id: user.Id,
      userId: user.Id,
      email: user.Email,
      role: user.Role || decoded.role || "user",
    };

    next();
  } catch (err) {
    res.status(401).json({ ok: false, message: "Token không hợp lệ" });
  }
}

module.exports = auth;
