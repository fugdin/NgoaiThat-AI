// 📁 src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { testDb } = require('./db');
const wizardRoutes = require('./routes/wizard');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  const ok = await testDb();
  res.json({ ok, time: new Date().toISOString() });
});

app.use('/api', wizardRoutes);

module.exports = app;
