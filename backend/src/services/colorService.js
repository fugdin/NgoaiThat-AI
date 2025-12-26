const { getPool, sql } = require("../db");

async function getAllColors() {
  const pool = await getPool();
  // Lấy danh sách màu để User chọn trong Visualizer
  const result = await pool.request().query("SELECT * FROM ColorPalette ORDER BY Brand, ColorName");
  return result.recordset;
}

module.exports = { getAllColors };