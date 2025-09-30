const sql = require('mssql');

const base = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

// Port / Instance
if (process.env.DB_PORT) base.port = Number(process.env.DB_PORT);
if (process.env.DB_INSTANCE) base.options.instanceName = process.env.DB_INSTANCE;

// Auth
let config;
if ((process.env.DB_AUTH || 'sql').toLowerCase() === 'windows') {
  config = {
    ...base,
    authentication: {
      type: 'ntlm',
      options: {
        userName: process.env.DB_USER,        // ví dụ FUDGIN-LAPTOP\Fugdin
        password: process.env.DB_PASS || '',
        domain: undefined                     // để trống cho local machine
      }
    }
  };
} else {
  config = {
    ...base,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  };
}

let pool;
async function getPool() {
  if (!pool) pool = await sql.connect(config);
  return pool;
}

async function testDb() {
  try {
    const p = await getPool();
    const r = await p.request().query('SELECT 1 AS ok');
    return r.recordset[0].ok === 1;
  } catch (e) {
    console.error('DB error:', e.message);
    return false;
  }
}

module.exports = { sql, getPool, testDb };
