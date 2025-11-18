const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../db");

const router = express.Router();

// Danh sách người dùng (dành cho admin)
router.get("/", async (req, res) => {
  try {
    let { page = 1, pageSize = 20, search = "", role = "" } = req.query;
    page = Math.max(parseInt(page, 10) || 1, 1);
    pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);

    const sanitizedSearch = search.trim();
    const normalizedRole = (role || "").trim().toLowerCase();

    const filters = [];
    if (sanitizedSearch) {
      filters.push("U.Email LIKE @Search");
    }
    if (normalizedRole && normalizedRole !== "all") {
      filters.push("LOWER(U.Role) = @Role");
    }
    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;

    const applyFilters = (request) => {
      if (sanitizedSearch) {
        request.input("Search", sql.NVarChar(191), `%${sanitizedSearch}%`);
      }
      if (normalizedRole && normalizedRole !== "all") {
        request.input("Role", sql.NVarChar(20), normalizedRole);
      }
      return request;
    };

    const pool = await getPool();

    const countResult = await applyFilters(pool.request()).query(
      `SELECT COUNT(*) AS total FROM Users U ${whereClause}`
    );
    const total = countResult.recordset?.[0]?.total || 0;

    const summaryResult = await applyFilters(pool.request()).query(
      `SELECT U.Role, COUNT(*) AS count FROM Users U ${whereClause} GROUP BY U.Role`
    );
    const roleSummary = summaryResult.recordset.reduce((acc, row) => {
      const key = (row.Role || "unknown").toLowerCase();
      acc[key] = row.count;
      return acc;
    }, {});

    const listQuery = `
      SELECT U.Id, U.Email, U.Role, U.CreatedAt,
             COUNT(G.Id) AS GenerationCount,
             MAX(G.CreatedAt) AS LastGenerationAt
      FROM Users U
      LEFT JOIN Generations G ON G.UserId = U.Id
      ${whereClause}
      GROUP BY U.Id, U.Email, U.Role, U.CreatedAt
      ORDER BY U.CreatedAt DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY;
    `;

    const listResult = await applyFilters(pool.request()).query(listQuery);
    const items = listResult.recordset || [];

    res.json({
      ok: true,
      data: {
        page,
        pageSize,
        total,
        roleSummary,
        items,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

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
