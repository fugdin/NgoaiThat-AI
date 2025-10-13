const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");
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

    let averageColor = null;
    try {
      const pixel = await sharp(req.file.buffer)
        .resize(1, 1, { fit: "cover" })
        .removeAlpha()
        .raw()
        .toBuffer();
      averageColor = {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        hex: `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1]
          .toString(16)
          .padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`,
      };
    } catch (colorErr) {
      console.warn("Không thể trích xuất màu chủ đạo:", colorErr.message);
    }

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
    SESS.set(tempId, {
      sampleImageUrl: up.secure_url,
      extractedLayout,
      averageColor,
    });

    return res.json({
      ok: true,
      data: {
        tempId,
        sampleImageUrl: up.secure_url,
        extractedLayout,
        averageColor,
      },
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

    if (ctx.averageColor?.hex) {
      stylePlan.dominantColor = ctx.averageColor;
      stylePlan.promptHint = `${stylePlan.promptHint} · ưu tiên tông màu ${ctx.averageColor.hex}`;
    }

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

    const houseBuffer = req.file.buffer;

    // 1. Upload ảnh nhà thật gốc
    const upHouse = await uploadBufferToCloudinary(
      houseBuffer,
      "exterior_ai/houses"
    );

    const targetColor = ctx.averageColor || {
      r: 210,
      g: 210,
      b: 210,
      hex: "#d2d2d2",
    };

    const requirementSummary = ctx.requirements?.join(", ");
    const promptParts = [
      "Photorealistic exterior visualization of this house facade, preserving existing structure",
      ctx.stylePlan?.combined?.length
        ? `Reference style cues: ${ctx.stylePlan.combined.join(", ")}`
        : null,
      targetColor?.hex
        ? `Dominant colour palette ${targetColor.hex.toUpperCase()} with matching materials`
        : null,
      requirementSummary ? `Client notes: ${requirementSummary}` : null,
      "Natural outdoor lighting, clean materials, sharp architectural detail, no deformation",
    ]
      .filter(Boolean)
      .join(". ");

    const negativePrompt =
      "blurry, lowres, distorted, text, watermark, people, interior, extra building";

    let outputBuffer = null;
    let modelLabel = "Stability AI SDXL image-to-image";
    let promptUsed = promptParts;

    if (process.env.STABILITY_API_KEY) {
      try {
        const formData = new FormData();
        formData.append("init_image", houseBuffer, {
          filename: "house.png",
          contentType: "image/png",
        });
        formData.append("image_strength", "0.45");
        formData.append("cfg_scale", "7");
        formData.append("samples", "1");
        formData.append("style_preset", "photographic");
        formData.append("text_prompts[0][text]", promptParts);
        formData.append("text_prompts[0][weight]", "1");
        formData.append("text_prompts[1][text]", negativePrompt);
        formData.append("text_prompts[1][weight]", "-1");

        const aiResp = await axios.post(
          "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image",
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
              Accept: "application/json",
            },
            timeout: 120000,
          }
        );

        const artifact = aiResp.data?.artifacts?.find((item) => item.base64);
        if (artifact?.base64) {
          outputBuffer = Buffer.from(artifact.base64, "base64");
        }
      } catch (aiErr) {
        modelLabel = "Tint stylisation fallback";
        console.error(
          "Stability AI generation failed:",
          aiErr.response?.data || aiErr.message
        );
      }
    } else {
      modelLabel = "Tint stylisation fallback";
      console.warn("STABILITY_API_KEY missing – dùng chế độ pha màu fallback.");
    }

    if (!outputBuffer) {
      modelLabel = "Tint stylisation fallback";
      const baseSharp = sharp(houseBuffer);
      const { width, height } = await baseSharp.metadata();

      let overlayBuffer = null;
      try {
        const sampleResp = await axios.get(ctx.sampleImageUrl, {
          responseType: "arraybuffer",
        });
        overlayBuffer = await sharp(Buffer.from(sampleResp.data))
          .resize(width || 1280, height || undefined, { fit: "cover" })
          .blur(15)
          .modulate({ saturation: 1.1 })
          .toBuffer();
      } catch (overlayErr) {
        console.warn("Không thể tạo overlay từ ảnh mẫu:", overlayErr.message);
      }

      let stylised = baseSharp.clone();
      if (width || height) {
        stylised = stylised.resize(width || undefined, height || undefined, {
          fit: "cover",
        });
      }

      stylised = stylised
        .modulate({ saturation: 1.12, brightness: 1.06 })
        .tint({
          r: targetColor.r,
          g: targetColor.g,
          b: targetColor.b,
        });

      if (overlayBuffer) {
        stylised = stylised.composite([
          {
            input: overlayBuffer,
            blend: "overlay",
            opacity: 0.35,
          },
        ]);
      }

      outputBuffer = await stylised.toBuffer();
      if (!promptUsed) {
        promptUsed = ctx.stylePlan?.promptHint || "Tint stylisation";
      }
    }

    const upResult = await uploadBufferToCloudinary(
      outputBuffer,
      "exterior_ai/results"
    );

    const outputDescription =
      modelLabel === "Stability AI SDXL image-to-image"
        ? promptParts
        : `Áp dụng phong cách ${ctx.stylePlan?.combined?.join(
            ", "
          )} với tông màu chủ đạo ${targetColor.hex.toUpperCase()}.`;
    const outputImageUrl = upResult.secure_url;

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
    reqDb.input("PromptUsed", sql.NVarChar(sql.MAX), promptUsed || null);
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
        colorApplied: targetColor,
        model: modelLabel,
        prompt: promptUsed,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Lỗi generate-final" });
  }
});

module.exports = router;
