// 📁 src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { testDb } = require('./db');
const wizardRoutes = require('./routes/wizard');
const historiesRoutes = require('./routes/histories');

// 🧩 middleware mới
const respond = require('./middlewares/respond');
const errorHandler = require('./middlewares/error');
const activityLogger = require('./middlewares/activityLogger');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan(':method :url :status :response-time ms'));

// ✅ Chuẩn hóa phản hồi
app.use(respond);

// Health check
app.get('/health', async (_req, res) => {
  const ok = await testDb();
  res.ok({ time: new Date().toISOString() });
});

// Routes chính
app.use('/api', wizardRoutes);
app.use('/api', historiesRoutes);

// ✅ Bắt lỗi cuối cùng
app.use(errorHandler);
app.use(activityLogger);

module.exports = app;
