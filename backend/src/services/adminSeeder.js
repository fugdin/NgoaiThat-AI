const bcrypt = require("bcrypt");
const { getPool, sql } = require("../db");

const DEFAULT_ADMIN_EMAIL =
  process.env.DEFAULT_ADMIN_EMAIL || "admin@ngoai-that.ai";
const DEFAULT_ADMIN_PASSWORD =
  process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123456";

async function ensureAdminAccount() {
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    console.warn(
      "[AdminSeeder] Thiếu DEFAULT_ADMIN_EMAIL hoặc DEFAULT_ADMIN_PASSWORD, bỏ qua seed admin."
    );
    return;
  }

  const pool = await getPool();
  const existingResult = await pool
    .request()
    .input("Email", sql.NVarChar(191), DEFAULT_ADMIN_EMAIL)
    .query("SELECT TOP 1 Id, Role FROM Users WHERE Email = @Email");

  const existing = existingResult.recordset?.[0];
  if (existing) {
    if (existing.Role !== "admin") {
      await pool
        .request()
        .input("Id", sql.BigInt, existing.Id)
        .query("UPDATE Users SET Role = 'admin' WHERE Id = @Id");
      console.log(
        `[AdminSeeder] Đã cập nhật role 'admin' cho ${DEFAULT_ADMIN_EMAIL}.`
      );
    }
    return;
  }

  const hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await pool
    .request()
    .input("Email", sql.NVarChar(191), DEFAULT_ADMIN_EMAIL)
    .input("PasswordHash", sql.NVarChar(255), hash)
    .query(`
      INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
      VALUES (@Email, @PasswordHash, 'admin', SYSDATETIME())
    `);

  console.log(
    `[AdminSeeder] Đã tạo tài khoản admin cố định ${DEFAULT_ADMIN_EMAIL}.`
  );
}

module.exports = { ensureAdminAccount };
