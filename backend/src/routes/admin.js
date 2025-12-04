const express = require("express");
const bcrypt = require("bcrypt");
const PDFDocument = require("pdfkit");
const { getPool, sql } = require("../db");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

/**
 * 1?? Dashboard th?ng k?
 * GET /api/admin/stats
 */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const q = `
      -- T?ng s? user
      SELECT COUNT(*) AS totalUsers FROM Users;

      -- T?ng s? l??t sinh ?nh
      SELECT COUNT(*) AS totalGenerations FROM Generations;

      -- S? l??t sinh ?nh h?m nay
      SELECT COUNT(*) AS todayGenerations
      FROM Generations
      WHERE CAST(CreatedAt AS date) = CAST(SYSDATETIME() AS date);

      -- Top 5 phong c?ch ph? bi?n
      SELECT TOP 5
        ISNULL(NULLIF(LTRIM(RTRIM(Style)), ''), N'Kh?ng r?') AS Style,
        COUNT(*) AS count
      FROM Generations
      GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(Style)), ''), N'Kh?ng r?')
      ORDER BY count DESC;

      -- Top 5 user ho?t ??ng nhi?u
      SELECT TOP 5
        U.Id        AS UserId,
        U.Email     AS Email,
        COUNT(G.Id) AS totalGenerations
      FROM Users U
      LEFT JOIN Generations G ON G.UserId = U.Id
      GROUP BY U.Id, U.Email
      ORDER BY totalGenerations DESC;
    `;

    const result = await pool.request().query(q);
    const [
      totalUsersRS,
      totalGenerationsRS,
      todayGenerationsRS,
      topStylesRS,
      topUsersRS,
    ] = result.recordsets;

    res.ok({
      totalUsers: totalUsersRS?.[0]?.totalUsers || 0,
      totalGenerations: totalGenerationsRS?.[0]?.totalGenerations || 0,
      todayGenerations: todayGenerationsRS?.[0]?.todayGenerations || 0,
      topStyles: topStylesRS || [],
      topActiveUsers: topUsersRS || [],
    });
  })
);

/**
 * 2?? Danh s?ch user (c? ph?n trang, l?c)
 * GET /api/admin/users
 */
router.get(
  "/users",
  asyncHandler(async (req, res) => {
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
      `SELECT COUNT(*) AS total FROM Users U ${whereClause};`
    );
    const total = countResult.recordset?.[0]?.total || 0;

    const summaryResult = await applyFilters(pool.request()).query(
      `SELECT U.Role, COUNT(*) AS count FROM Users U ${whereClause} GROUP BY U.Role;`
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
    res.ok({
      page,
      pageSize,
      total,
      roleSummary,
      items: listResult.recordset || [],
    });
  })
);

/**
 * 3?? C?p nh?t role user
 * PATCH /api/admin/users/:id/role
 * body: { role: "admin" | "user" }
 */
router.patch(
  "/users/:id/role",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!role || !["admin", "user"].includes(role)) {
      return res.status(400).json({
        ok: false,
        message: "Role kh?ng h?p l? (admin | user)",
      });
    }

    const pool = await getPool();

    const updateResult = await pool
      .request()
      .input("Id", sql.BigInt, Number(id))
      .input("Role", sql.NVarChar(20), role)
      .query(`
        UPDATE Users
        SET Role = @Role
        WHERE Id = @Id;
      `);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({
        ok: false,
        message: "Kh?ng t?m th?y user",
      });
    }

    const selectResult = await pool
      .request()
      .input("Id", sql.BigInt, Number(id))
      .query(`
        SELECT Id, Email, Role, CreatedAt
        FROM Users
        WHERE Id = @Id;
      `);

    const user = selectResult.recordset[0];

    res.ok({ user });
  })
);

/**
 * 3b) Th?m m?i user (admin t?o)
 * POST /api/admin/users
 */
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    const { email, password, role = "user" } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Email v? m?t kh?u kh?ng ???c ?? tr?ng" });
    }
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({
        ok: false,
        message: "Role kh?ng h?p l? (admin | user)",
      });
    }

    const pool = await getPool();

    const existsResult = await pool
      .request()
      .input("Email", sql.NVarChar(191), email)
      .query("SELECT Id FROM Users WHERE Email = @Email;");
    if (existsResult.recordset?.length) {
      return res
        .status(409)
        .json({ ok: false, message: "Email ?? t?n t?i" });
    }

    const hash = await bcrypt.hash(password, 10);

    const insertResult = await pool
      .request()
      .input("Email", sql.NVarChar(191), email)
      .input("PasswordHash", sql.NVarChar(255), hash)
      .input("Role", sql.NVarChar(20), role)
      .query(`
        INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
        OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.Role, INSERTED.CreatedAt
        VALUES (@Email, @PasswordHash, @Role, SYSDATETIME());
      `);

    const user = insertResult.recordset?.[0];
    res.ok({ user });
  })
);

/**
 * 3c) C?p nh?t email / role / m?t kh?u user
 * PUT /api/admin/users/:id
 */
router.put(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, password, role } = req.body || {};
    const updates = [];

    if (email) {
      updates.push("Email = @Email");
    }
    if (role) {
      if (!["admin", "user"].includes(role)) {
        return res.status(400).json({
          ok: false,
          message: "Role kh?ng h?p l? (admin | user)",
        });
      }
      updates.push("Role = @Role");
    }
    if (password) {
      updates.push("PasswordHash = @PasswordHash");
    }

    if (!updates.length) {
      return res
        .status(400)
        .json({ ok: false, message: "Kh?ng c? tr??ng n?o ?? c?p nh?t" });
    }

    const pool = await getPool();
    const request = pool.request().input("Id", sql.BigInt, Number(id));

    if (email) {
      request.input("Email", sql.NVarChar(191), email);
    }
    if (role) {
      request.input("Role", sql.NVarChar(20), role);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      request.input("PasswordHash", sql.NVarChar(255), hash);
    }

    const updateResult = await request.query(`
      UPDATE Users
      SET ${updates.join(", " )}
      WHERE Id = @Id;
    `);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({
        ok: false,
        message: "Kh?ng t?m th?y user",
      });
    }

    const selectResult = await pool
      .request()
      .input("Id", sql.BigInt, Number(id))
      .query(`
        SELECT Id, Email, Role, CreatedAt
        FROM Users
        WHERE Id = @Id;
      `);

    const user = selectResult.recordset?.[0] || null;
    res.ok({ user });
  })
);

/**
 * 4?? Xo? user (optional)
 * DELETE /api/admin/users/:id
 */
router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("Id", sql.BigInt, Number(id))
      .query("DELETE FROM Users WHERE Id = @Id;");

    res.ok({
      deleted: result.rowsAffected?.[0] || 0,
    });
  })
);

/**
 * 4b) T?ng h?p l??t sinh ?nh theo user (ph?n trang)
 * GET /api/admin/generations/by-user
 */
router.get(
  "/generations/by-user",
  asyncHandler(async (req, res) => {
    let { page = 1, pageSize = 5, search = "" } = req.query;
    page = Math.max(parseInt(page, 10) || 1, 1);
    pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 5, 1), 100);
    const offset = (page - 1) * pageSize;
    const sanitizedSearch = search.trim();

    const whereClause = sanitizedSearch ? "WHERE U.Email LIKE @Search" : "";
    const applyFilters = (request) => {
      if (sanitizedSearch) {
        request.input("Search", sql.NVarChar(191), `%${sanitizedSearch}%`);
      }
      return request;
    };

    const pool = await getPool();

    const countResult = await applyFilters(pool.request()).query(`
      SELECT COUNT(*) AS total FROM (
        SELECT U.Id
        FROM Users U
        LEFT JOIN Generations G ON G.UserId = U.Id
        ${whereClause}
        GROUP BY U.Id
      ) AS Summary;
    `);
    const total = countResult.recordset?.[0]?.total || 0;

    const listResult = await applyFilters(pool.request())
      .input("Offset", sql.Int, offset)
      .input("PageSize", sql.Int, pageSize)
      .query(`
        SELECT *
        FROM (
          SELECT
            U.Id AS UserId,
            U.Email,
            U.Role,
            COUNT(G.Id) AS GenerationCount,
            MAX(G.CreatedAt) AS LastGenerationAt
          FROM Users U
          LEFT JOIN Generations G ON G.UserId = U.Id
          ${whereClause}
          GROUP BY U.Id, U.Email, U.Role
        ) AS Summary
        ORDER BY LastGenerationAt DESC, UserId DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY;
      `);

    res.ok({
      page,
      pageSize,
      total,
      items: listResult.recordset || [],
    });
  })
);

/**
 * 5?? Danh s?ch log sinh ?nh (Generations)
 * GET /api/admin/generations?userId=&style=&from=&to=&page=1&pageSize=20
 */
router.get(
  "/generations",
  asyncHandler(async (req, res) => {
    let { page = 1, pageSize = 20, userId, style, from, to } = req.query;
    page = Math.max(parseInt(page, 10) || 1, 1);
    pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);
    const offset = (page - 1) * pageSize;

    const pool = await getPool();

    const filters = [];
    const params = [];

    const addParam = (name, type, value) => {
      params.push({ name, type, value });
      return name;
    };

    if (userId) {
      const numericUserId = Number(userId);
      if (!Number.isNaN(numericUserId)) {
        filters.push("G.UserId = @UserId");
        addParam("UserId", sql.BigInt, numericUserId);
      }
    }

    if (style) {
      filters.push("G.Style = @Style");
      addParam("Style", sql.NVarChar(200), style);
    }

    const parseDate = (value) => {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const fromDate = from ? parseDate(from) : null;
    if (fromDate) {
      filters.push("G.CreatedAt >= @FromDate");
      addParam("FromDate", sql.DateTime2, fromDate);
    }

    const toDate = to ? parseDate(to) : null;
    if (toDate) {
      filters.push("G.CreatedAt <= @ToDate");
      addParam("ToDate", sql.DateTime2, toDate);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const applyParams = (request) => {
      params.forEach((p) => request.input(p.name, p.type, p.value));
      return request;
    };

    const countQ = `
      SELECT COUNT(*) AS total
      FROM Generations G
      ${where};
    `;

    const countResult = await applyParams(pool.request()).query(countQ);
    const total = countResult.recordset?.[0]?.total || 0;

    const listQ = `
      SELECT
        G.Id,
        G.UserId,
        U.Email,
        G.InputDesc,
        G.InputImageUrl,
        G.OutputImageUrl,
        G.Style,
        G.Palette,
        G.PromptUsed,
        G.CreatedAt
      FROM Generations G
      INNER JOIN Users U ON U.Id = G.UserId
      ${where}
      ORDER BY G.CreatedAt DESC
      OFFSET @Offset ROWS
      FETCH NEXT @PageSize ROWS ONLY;
    `;

    const listResult = await applyParams(pool.request())
      .input("Offset", sql.Int, offset)
      .input("PageSize", sql.Int, pageSize)
      .query(listQ);

    res.ok({
      page,
      pageSize,
      total,
      items: listResult.recordset || [],
    });
  })
);

/**
 * 6?? Chi ti?t 1 Generation
 * GET /api/admin/generations/:id
 */
router.get(
  "/generations/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = await getPool();
    const q = `
      SELECT
        G.Id,
        G.UserId,
        U.Email,
        G.InputDesc,
        G.InputImageUrl,
        G.OutputImageUrl,
        G.Style,
        G.Palette,
        G.Seed,
        G.PromptUsed,
        G.CreatedAt,
        G.Description
      FROM Generations G
      INNER JOIN Users U ON U.Id = G.UserId
      WHERE G.Id = @Id;
    `;

    const result = await pool
      .request()
      .input("Id", sql.BigInt, Number(id))
      .query(q);

    const row = result.recordset?.[0];
    if (!row) {
      return res
        .status(404)
        .json({ ok: false, message: "Kh?ng t?m th?y b?n ghi" });
    }

    res.ok({ item: row });
  })
);

/**
 * 7?? Xo? 1 Generation
 * DELETE /api/admin/generations/:id
 */
router.delete(
  "/generations/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("Id", sql.BigInt, Number(id))
      .query("DELETE FROM Generations WHERE Id = @Id;");

    res.ok({
      deleted: result.rowsAffected?.[0] || 0,
    });
  })
);

/**
 * 8?? Xu?t PDF cho 1 Generation
 * GET /api/admin/generations/:id/export-pdf
 */
router.get(
  "/generations/:id/export-pdf",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = await getPool();
    const q = `
      SELECT
        G.Id,
        G.UserId,
        U.Email,
        G.InputDesc,
        G.InputImageUrl,
        G.OutputImageUrl,
        G.Style,
        G.Palette,
        G.PromptUsed,
        G.CreatedAt,
        G.Description
      FROM Generations G
      INNER JOIN Users U ON U.Id = G.UserId
      WHERE G.Id = @Id;
    `;

    const result = await pool
      .request()
      .input("Id", sql.BigInt, Number(id))
      .query(q);

    const row = result.recordset?.[0];
    if (!row) {
      return res
        .status(404)
        .json({ ok: false, message: "Kh?ng t?m th?y b?n ghi" });
    }

    const createdAt =
      row.CreatedAt instanceof Date
        ? row.CreatedAt
        : new Date(row.CreatedAt || Date.now());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="generation-${row.Id}.pdf"`
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text("B?O C?O PH??NG ?N NGO?I TH?T", {
      align: "center",
    });
    doc.moveDown();

    doc.fontSize(11);
    doc.text(`M? b?n ghi: ${row.Id}`);
    doc.text(`Ng??i d?ng: ${row.Email}`);
    doc.text(`Ng?y t?o: ${createdAt.toISOString()}`);
    doc.moveDown();

    doc.text("M? t? ??u v?o:", { underline: true });
    doc.text(row.InputDesc || "Kh?ng c?");
    doc.moveDown();

    doc.text("Phong c?ch:", { underline: true });
    doc.text(row.Style || "Kh?ng r?");
    doc.moveDown();

    doc.text("B?ng m?u:", { underline: true });
    doc.text(row.Palette || "Kh?ng r?");
    doc.moveDown();

    doc.text("Prompt AI:", { underline: true });
    doc.text(row.PromptUsed || "Kh?ng l?u");
    doc.moveDown();

    if (row.InputImageUrl) {
      doc.addPage();
      doc.fontSize(14).text("?nh hi?n tr?ng", { align: "center" });
      doc.moveDown();
      try {
        doc.image(row.InputImageUrl, {
          fit: [500, 400],
          align: "center",
          valign: "center",
        });
      } catch (err) {
        doc.fontSize(11).text("Kh?ng t?i ???c ?nh hi?n tr?ng (URL kh?ng h?p l?)");
      }
    }

    if (row.OutputImageUrl) {
      doc.addPage();
      doc.fontSize(14).text("?nh g?i ? ngo?i th?t", { align: "center" });
      doc.moveDown();
      try {
        doc.image(row.OutputImageUrl, {
          fit: [500, 400],
          align: "center",
          valign: "center",
        });
      } catch (err) {
        doc.fontSize(11).text("Kh?ng t?i ???c ?nh g?i ? (URL kh?ng h?p l?)");
      }
    }

    doc.end();
  })
);

module.exports = router;
