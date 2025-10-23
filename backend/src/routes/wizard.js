const express = require("express");
const multer = require("multer");
const { uploadBufferToCloudinary } = require("../services/cloud");
const { getPool, sql } = require("../db");
const crypto = require("crypto");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Bộ nhớ tạm để giữ context theo phiên (tempId)
const SESS = new Map();

/**
 * 1) Upload ảnh mẫu → rút trích mock
 * POST /api/upload-sample  (multipart: sample)
 */
router.post("/upload-sample", upload.single("sample"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ ok: false, message: "Thiếu file sample" });

    // 1. Upload sample lên Cloudinary
    const up = await uploadBufferToCloudinary(
      req.file.buffer,
      "exterior_ai/samples"
    );

    // 2. Mock “rút trích bố cục”
    const extractedLayout = {
      styleKeywords: ["modern", "clean-lines", "light-palette"],
      notes: "Facade with slim aluminum fins and light stone texture",
    };

    // 3. Tạo tempId + lưu session tạm
    const tempId = crypto.randomUUID();
    SESS.set(tempId, { sampleImageUrl: up.secure_url, extractedLayout });

    return res.json({
      ok: true,
      data: { tempId, sampleImageUrl: up.secure_url, extractedLayout },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Lỗi upload-sample" });
  }
});

/**
 * 2) Gửi yêu cầu thiết kế → kết hợp mock
 * POST /api/generate-style { tempId, requirements: [] }
 */
router.post("/generate-style", async (req, res) => {
  debugger;
  try {
    const { tempId, requirements } = req.body;

    if (!tempId || !requirements) {
      return res.status(400).json({ ok: false, message: "Thiếu dữ liệu!" });
    }

    const pool = await getPool();
    await pool
      .request()
      .input("UserId", 1)
      .input("InputDesc", requirements.aiSuggestions || "")
      .input("Style", requirements.style || "")
      .input("Palette", requirements.colorPalette || "").query(`
        INSERT INTO Generations (UserId, InputDesc, Style, Palette, CreatedAt)
        VALUES (@UserId, @InputDesc, @Style, @Palette, SYSDATETIME());
      `);

    res.json({
      ok: true,
      message: "Đã lưu thông tin phong cách thành công!",
    });
  } catch (err) {
    console.error("Generate-style error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * 3) Upload ảnh nhà thật → sinh ảnh cuối (mock) & LƯU DB
 * POST /api/generate-final  (multipart: house; fields: tempId)
 */
router.post("/generate-final", upload.single("house"), async (req, res) => {
  //const trxUserId = 1; // tạm thời cố định userId = 1
  const trxUserId = req.user?.userId || 1;

  try {
    const { tempId } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ ok: false, message: "Thiếu file house" });
    }

    // 1️⃣ Upload ảnh nhà thật lên Cloudinary
    const upHouse = await uploadBufferToCloudinary(
      file.buffer,
      "exterior_ai/houses"
    );

    // 2️⃣ Sinh “mock output” (ở đây tạm dùng lại ảnh gốc làm output)
    const outputImageUrl = upHouse.secure_url.replace(
      "/upload/",
      "/upload/ai-output/"
    );

    const outputDescription =
      "Ảnh kết quả mô phỏng được sinh thành công (mock).";

    // 3️⃣ Lưu vào DB
    const pool = await getPool();
    const result = await pool
      .request()
      .input("UserId", sql.BigInt, trxUserId)
      .input("InputDesc", sql.NVarChar(sql.MAX), outputDescription)
      .input("InputImageUrl", sql.NVarChar(500), upHouse.secure_url)
      .input("OutputImageUrl", sql.NVarChar(500), outputImageUrl)
      .input("Style", sql.NVarChar(200), null)
      .input("Palette", sql.NVarChar(200), null)
      .input("Seed", sql.BigInt, null)
      .input("PromptUsed", sql.NVarChar(sql.MAX), null).query(`
        INSERT INTO Generations 
        (UserId, InputDesc, InputImageUrl, OutputImageUrl, Style, Palette, Seed, PromptUsed, CreatedAt)
        OUTPUT INSERTED.Id AS generationId
        VALUES (@UserId, @InputDesc, @InputImageUrl, @OutputImageUrl, @Style, @Palette, @Seed, @PromptUsed, SYSDATETIME());
      `);

    const generationId = result.recordset[0].generationId;

    res.json({
      ok: true,
      data: {
        generationId,
        inputImageUrl: upHouse.secure_url,
        outputImageUrl,
      },
    });
  } catch (err) {
    console.error("Generate-final error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
