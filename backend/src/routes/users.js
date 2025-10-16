const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../db");

const router = express.Router();

// Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const pool = await getPool();
    await pool.request()
      .input("Email", sql.NVarChar(191), email)
      .input("PasswordHash", sql.NVarChar(255), hash)
      .query(`
        INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
        VALUES (@Email, @PasswordHash, 'user', SYSDATETIME());
      `);

    res.json({ ok: true, message: "Đăng ký thành công!" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = await getPool();
    const result = await pool.request()
      .input("Email", sql.NVarChar(191), email)
      .query("SELECT * FROM Users WHERE Email = @Email");

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ ok: false, message: "Email không tồn tại" });

    const valid = await bcrypt.compare(password, user.PasswordHash);
    if (!valid) return res.status(400).json({ ok: false, message: "Sai mật khẩu" });

    const token = jwt.sign(
      { userId: user.Id, email: user.Email, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      ok: true,
      token,
      user: { id: user.Id, email: user.Email, role: user.Role },
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
