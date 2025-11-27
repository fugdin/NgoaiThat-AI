// 📁 src/app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const { testDb } = require("./db");
const wizardRoutes = require("./routes/wizard");
const historiesRoutes = require("./routes/histories");
const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");


// 🧩 middlewares
const respond = require("./middlewares/respond");
const errorHandler = require("./middlewares/error");
const activityLogger = require("./middlewares/activityLogger");
const fileUpload = require("express-fileupload");
const auth = require("./middlewares/auth");
const multer = require("multer");
const requireAdmin = require("./middlewares/isAdmin");


const app = express();
app.use((req, res, next) => {
  res.ok = (data) => {
    res.json({
      ok: true,
      ...data
    });
  };
  next();
});

// ✅ Cấu hình cơ bản
app.use(cors());
app.use(morgan(":method :url :status :response-time ms"));
// ✅ Parser JSON cho các route API thông thường
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", wizardRoutes);

// ✅ Route upload riêng có middleware fileUpload
app.use(
  "/api/upload-sample",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
  wizardRoutes
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ✅ Route khác (generate-style, generate-final, histories, users)

app.use("/api/histories", historiesRoutes);
app.use("/api/users", usersRoutes);

// ✅ Route yêu cầu đăng nhập (JWT)
app.use("/api/secure", auth, wizardRoutes);
app.use("/api/secure", auth, historiesRoutes);

app.use("/api/admin", auth, requireAdmin, adminRoutes);
// ✅ Chuẩn hóa phản hồi
app.use(respond);

// ✅ Health check
app.get("/health", async (_req, res) => {
  const ok = await testDb();
  res.ok({ time: new Date().toISOString(), ok });
});

// ✅ Logging + Bắt lỗi
app.use(activityLogger);
app.use(errorHandler);

module.exports = app;
