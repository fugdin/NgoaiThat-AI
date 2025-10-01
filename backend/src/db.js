// db.js
const sql = require("mssql");

// Base config (dùng chung cho SQL Auth & Windows Auth)
const base = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Local dev: false; Prod Azure: true (cân nhắc .env)
    trustServerCertificate: true, // Local SQL Server self-signed
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

// Port / Instance (tùy môi trường, chỉ nên dùng 1 trong 2)
if (process.env.DB_PORT) base.port = Number(process.env.DB_PORT);
if (process.env.DB_INSTANCE) base.options.instanceName = process.env.DB_INSTANCE;

// ---- Auth selection ----
let config;
const authMode = (process.env.DB_AUTH || "sql").toLowerCase();

if (authMode === "windows") {
  // Hỗ trợ DB_USER dạng "DOMAIN\\user" hoặc dùng DB_DOMAIN + DB_USER
  let domain = process.env.DB_DOMAIN || "";
  let user = process.env.DB_USER || "";

  if (!domain && user && user.includes("\\")) {
    const [d, u] = user.split("\\");
    domain = d;
    user = u;
  }

  config = {
    ...base,
    authentication: {
      type: "ntlm",
      options: {
        domain: domain || undefined,   // ví dụ: "FUDGIN-LAPTOP"
        userName: user || undefined,   // ví dụ: "Fugdin"
        // Với NTLM, driver thường yêu cầu user/password. Nếu bạn muốn dùng
        // tài khoản hiện tại không cung cấp password, để trống cũng được,
        // nhưng một số môi trường có thể cần password domain.
        password: process.env.DB_PASS || "",
      },
    },
  };
} else {
  // SQL Authentication (mặc định)
  config = {
    ...base,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  };
}

// ---- Singleton pool ----
let _pool;

async function getPool() {
  if (_pool) return _pool;
  _pool = await sql.connect(config);
  return _pool;
}

async function testDb() {
  try {
    const p = await getPool();
    const r = await p.request().query("SELECT 1 AS ok");
    return r.recordset?.[0]?.ok === 1;
  } catch (e) {
    console.error("DB error:", e.message);
    return false;
  }
}

module.exports = { sql, config, getPool, testDb };
