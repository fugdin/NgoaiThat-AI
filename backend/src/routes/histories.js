const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const asyncHandler = require('../middlewares/asyncHandler');
const auth = require('../middlewares/auth');


/**
 * GET /api/histories
 * Query: ?page=1&pageSize=12&userId=1
 */
router.get('/histories', auth, asyncHandler(async (req, res) => {
  let { page = 1, pageSize = 12, userId } = req.query;
  page = Math.max(parseInt(page, 10) || 1, 1);
  pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 12, 1), 50);

  const pool = await getPool();
  const reqDb = pool.request();
  const userIdSafe = req.user.id;  
  reqDb.input('UserId', sql.BigInt, userIdSafe);

  const offset = (page - 1) * pageSize;

  // 👉 Query 1: đếm tổng số
  const countQ = `
    SELECT COUNT(*) AS total
    FROM Generations
    WHERE UserId = @UserId
  `;
  const countResult = await reqDb.query(countQ);
  const total = countResult.recordset[0]?.total || 0;

  // 👉 Query 2: lấy danh sách trang hiện tại
  const listQ = `
    SELECT Id, UserId, InputDesc, InputImageUrl, OutputImageUrl,
           Style, Palette, PromptUsed, CreatedAt
    FROM Generations
    WHERE UserId = @UserId
    ORDER BY CreatedAt DESC
    OFFSET ${offset} ROWS
    FETCH NEXT ${pageSize} ROWS ONLY
  `;
  const listResult = await pool.request()
    .input('UserId', sql.BigInt, userIdSafe)
    .query(listQ);

  const items = listResult.recordset || [];
  res.ok({ page, pageSize, total, items });
}));



module.exports = router;
