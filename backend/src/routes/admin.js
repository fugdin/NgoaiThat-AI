const express = require("express");
const PDFDocument = require("pdfkit");
const { getPool, sql } = require("../db");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

/**
 * 1️⃣ Dashboard thống kê
 * GET /api/admin/stats
 */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const q = `
      -- Tổng số user
      SELECT COUNT(*) AS totalUsers FROM Users;

      -- Tổng số lượt sinh ảnh
      SELECT COUNT(*) AS totalGenerations FROM Generations;

      -- Số lượt sinh ảnh hôm nay
      SELECT COUNT(*) AS todayGenerations
      FROM Generations
      WHERE CAST(CreatedAt AS date) = CAST(SYSDATETIME() AS date);

      -- Top 5 phong cách phổ biến
      SELECT TOP 5
        ISNULL(NULLIF(LTRIM(RTRIM(Style)), ''), N'Không rõ') AS Style,
        COUNT(*) AS count
      FROM Generations
      GROUP BY ISNULL(NULLIF(LTRIM(RTRIM(Style)), ''), N'Không rõ')
      ORDER BY count DESC;

      -- Top 5 user hoạt động nhiều
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
 * 2️⃣ Danh sách user
 * GET /api/admin/users
 */
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const pool = await getPool();
    const q = `
      SELECT
        U.Id,
        U.Email,
        U.Role,
        U.CreatedAt,
        COUNT(G.Id) AS totalGenerations
      FROM Users U
      LEFT JOIN Generations G ON G.UserId = U.Id
      GROUP BY U.Id, U.Email, U.Role, U.CreatedAt
      ORDER BY U.CreatedAt DESC;
    `;
    const result = await pool.request().query(q);
    res.ok({ items: result.recordset || [] });
  })
);

/**
 * 3️⃣ Cập nhật role user
 * PATCH /api/admin/users/:id/role
 * body: { role: "admin" | "user" }
 */
router.patch(
  "/users/:id/role",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body || {};

    // Validate role
    if (!role || !["admin", "user"].includes(role)) {
      return res.status(400).json({
        ok: false,
        message: "Role không hợp lệ (admin | user)",
      });
    }

    const pool = await getPool();

    // --- 1. UPDATE USER ROLE ---
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
        message: "Không tìm thấy user",
      });
    }

    // --- 2. SELECT USER AFTER UPDATE ---
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
 * 4️⃣ Xoá user (optional)
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
 * 5️⃣ Danh sách log sinh ảnh (Generations)
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
 * 6️⃣ Chi tiết 1 Generation
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
        .json({ ok: false, message: "Không tìm thấy bản ghi" });
    }

    res.ok({ item: row });
  })
);

/**
 * 7️⃣ Xoá 1 Generation
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
 * 8️⃣ Xuất PDF cho 1 Generation
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
        .json({ ok: false, message: "Không tìm thấy bản ghi" });
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

    doc.fontSize(18).text("BÁO CÁO PHƯƠNG ÁN NGOẠI THẤT", {
      align: "center",
    });
    doc.moveDown();

    doc.fontSize(11);
    doc.text(`Mã bản ghi: ${row.Id}`);
    doc.text(`Người dùng: ${row.Email}`);
    doc.text(`Ngày tạo: ${createdAt.toISOString()}`);
    doc.moveDown();

    doc.text("Mô tả đầu vào:", { underline: true });
    doc.text(row.InputDesc || "Không có");
    doc.moveDown();

    doc.text("Phong cách:", { underline: true });
    doc.text(row.Style || "Không rõ");
    doc.moveDown();

    doc.text("Bảng màu:", { underline: true });
    doc.text(row.Palette || "Không rõ");
    doc.moveDown();

    doc.text("Prompt AI:", { underline: true });
    doc.text(row.PromptUsed || "Không lưu");
    doc.moveDown();

    if (row.InputImageUrl) {
      doc.addPage();
      doc.fontSize(14).text("Ảnh hiện trạng", { align: "center" });
      doc.moveDown();
      try {
        doc.image(row.InputImageUrl, {
          fit: [500, 400],
          align: "center",
          valign: "center",
        });
      } catch (err) {
        doc.fontSize(11).text("Không tải được ảnh hiện trạng (URL không hợp lệ)");
      }
    }

    if (row.OutputImageUrl) {
      doc.addPage();
      doc.fontSize(14).text("Ảnh gợi ý ngoại thất", { align: "center" });
      doc.moveDown();
      try {
        doc.image(row.OutputImageUrl, {
          fit: [500, 400],
          align: "center",
          valign: "center",
        });
      } catch (err) {
        doc.fontSize(11).text("Không tải được ảnh gợi ý (URL không hợp lệ)");
      }
    }

    doc.end();
  })
);

module.exports = router;
