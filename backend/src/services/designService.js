const { getPool, sql } = require("../db");

// Hàm lưu hoặc cập nhật cấu hình phối màu có kèm UserId
async function saveDesign(generationId, userId, configJson) {
  const pool = await getPool();
  // Chuyển Object JSON thành chuỗi để lưu vào cột nvarchar(max)
  const configString = JSON.stringify(configJson);

  return await pool.request()
    .input("generationId", sql.BigInt, generationId)
    .input("userId", sql.BigInt, userId)
    .input("configJson", sql.NVarChar(sql.MAX), configString)
    .query(`
      IF EXISTS (SELECT 1 FROM DesignConfigs WHERE GenerationId = @generationId)
      BEGIN
        -- Cập nhật nếu đã tồn tại (Chỉ cập nhật nếu đúng chủ sở hữu hoặc logic dự án cho phép)
        UPDATE DesignConfigs 
        SET ConfigJson = @configJson, 
            UserId = @userId, 
            UpdatedAt = GETDATE()
        WHERE GenerationId = @generationId
      END
      ELSE
      BEGIN
        -- Thêm mới nếu chưa có
        INSERT INTO DesignConfigs (GenerationId, UserId, ConfigJson)
        VALUES (@generationId, @userId, @configJson)
      END
    `);
}

// Hàm lấy cấu hình đã lưu của một ảnh
async function getDesign(generationId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("generationId", sql.BigInt, generationId)
    .query("SELECT ConfigJson, UserId FROM DesignConfigs WHERE GenerationId = @generationId");
  
  return result.recordset[0];
}

module.exports = { saveDesign, getDesign };