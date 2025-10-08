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
router.post("/generate-style", express.json(), async (req, res) => {
  try {
    const { tempId, requirements = [] } = req.body || {};
    if (!tempId || !SESS.has(tempId)) {
      return res
        .status(400)
        .json({ ok: false, message: "tempId không hợp lệ" });
    }
    const ctx = SESS.get(tempId);

    // Mock “kế hoạch phong cách”
    const stylePlan = {
      combined: [
        ...(ctx.extractedLayout?.styleKeywords || []),
        ...requirements,
      ],
      promptHint: `Modern clean lines with ${requirements.join(", ")}`,
    };

    ctx.requirements = requirements;
    ctx.stylePlan = stylePlan;
    SESS.set(tempId, ctx);

    return res.json({ ok: true, data: { tempId, stylePlan } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Lỗi generate-style" });
  }
});

/**
 * 3) Upload ảnh nhà thật → sinh ảnh cuối (mock) & LƯU DB
 * POST /api/generate-final  (multipart: house; fields: tempId)
 */
router.post("/generate-final", upload.single("house"), async (req, res) => {
  const trxUserId = 1; // tạm hardcode user 1 cho tuần này (chưa auth)

  try {
    const { tempId } = req.body || {};
    if (!tempId || !SESS.has(tempId)) {
      return res
        .status(400)
        .json({ ok: false, message: "tempId không hợp lệ" });
    }
    if (!req.file)
      return res.status(400).json({ ok: false, message: "Thiếu file house" });

    const ctx = SESS.get(tempId);

    // 1. Upload ảnh nhà thật
    const upHouse = await uploadBufferToCloudinary(
      req.file.buffer,
      "exterior_ai/houses"
    );

    // 2. Mock “sinh ảnh kết quả”: ở đây demo bằng cách… re-upload 1 thumbnail quick
    // Thực tế: gọi API AI → nhận buffer/URL → upload Cloudinary → lấy secure_url
    const outputDescription = `Kết hợp ${ctx.extractedLayout?.styleKeywords?.join(
      ", "
    )} với yêu cầu ${ctx.requirements?.join(", ")}`;
    const outputImageUrl = ctx.sampleImageUrl; // tạm mượn sample làm output để demo

    // 3. Lưu DB vào Generations
    const pool = await getPool();
    const q = `
  INSERT INTO Generations (UserId, InputDesc, InputImageUrl, OutputImageUrl, Style, Palette, Seed, PromptUsed, CreatedAt)
  OUTPUT INSERTED.Id AS generationId
  VALUES (@UserId, @InputDesc, @InputImageUrl, @OutputImageUrl, @Style, @Palette, @Seed, @PromptUsed, SYSDATETIME());
`;
    const reqDb = pool.request();
    reqDb.input("UserId", sql.BigInt, trxUserId);
    reqDb.input("InputDesc", sql.NVarChar(sql.MAX), outputDescription);
    reqDb.input("InputImageUrl", sql.NVarChar(500), upHouse.secure_url); // house image
    reqDb.input("OutputImageUrl", sql.NVarChar(500), outputImageUrl); // mock result
    reqDb.input(
      "Style",
      sql.NVarChar(200),
      (ctx.stylePlan?.combined || []).join(", ")
    );
    reqDb.input("Palette", sql.NVarChar(200), null);
    reqDb.input("Seed", sql.BigInt, null);
    reqDb.input(
      "PromptUsed",
      sql.NVarChar(sql.MAX),
      ctx.stylePlan?.promptHint || null
    );
    const inserted = await reqDb.query(q);
    const generationId = inserted.recordset[0].generationId;

    // 4. Clear session tạm (tuỳ thích)
    SESS.delete(tempId);

    return res.json({
      ok: true,
      data: {
        generationId,
        userHouseImageUrl: upHouse.secure_url,
        outputImageUrl,
        description: outputDescription,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Lỗi generate-final" });
  }
});

module.exports = router;
