const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
require("dotenv").config();
const { uploadBufferToCloudinary } = require("../services/cloud");
const { 
  analyzeImage, // Phân tích ảnh
  generateImageExternal, // Tạo ảnh
  generateImageFromThreeServices, // Tạo 3 ảnh từ 3 services
  generateImageFromImages, // Image-to-image
} = require("../services/external-ai");
const { getPool, sql } = require("../db");

// Khởi tạo Express Router
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const SESS = new Map();

/**
 * 1️⃣ Upload ảnh mẫu → Phân tích bằng External AI Services
 */
router.post("/upload-sample", upload.single("sample"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ ok: false, message: "Thiếu file sample" });

    // Upload ảnh mẫu lên Cloudinary
    const up = await uploadBufferToCloudinary(req.file.buffer, "exterior_ai/samples");

    const prompt = `
SYSTEM INSTRUCTIONS

You are an AI architecture and exterior design analyst.

Your main role is to analyze house or building images and extract the structural components with precise visual references.

When given an image, you must:
1. Identify and describe **each architectural component** clearly:
   - Walls (location, color, material, style)
   - Columns (position, design, height, decorative details)
   - Roof (type, slope, material, color)
   - Windows (shape, frame type, glass tone, distribution)
   - Doors (location, material, color, design style)
   - Balcony or terrace (position, railing material, decoration)
   - Decorative elements (arches, moldings, trims, cornices, lighting)
   - Foundation / base / stairs (type, height, visibility)
   - Any **unique materials** (stone, glass, metal, wood, paint texture)

2. For each element, describe **where** it is located in the image
   (e.g., "The wall is located on the left half of the house, painted white, with vertical grooves.")

3. Mention **relationships** between parts when relevant
   (e.g., "The columns support the balcony roof; the window frame aligns with the top cornice.")

4. Use **clear sectioned format**:
   - "1. Walls — …"
   - "2. Roof — …"
   - etc.

5. Output should always be **in Vietnamese**, clear and professional, like a design report for an architecture student or engineer.

If possible, provide both:
- **Descriptive version (text explanation)**
- **Summarized version (bullet points)**

You must NOT invent or hallucinate unseen details — describe only what is visually evident from the image.

Please analyze the provided exterior image according to these instructions.
`;


    // Gọi External AI service để phân tích ảnh
    const analysis = await analyzeImage(
      req.file.buffer,
      req.file.mimetype,
      prompt
    );

    const extractedLayout = {
      aiSummary: analysis,
      sampleImageUrl: up.secure_url,
      sampleImageBuffer: req.file.buffer, // Lưu buffer để dùng sau
      sampleMimeType: req.file.mimetype,  // Lưu mime type
    };

    const tempId = crypto.randomUUID();
    SESS.set(tempId, extractedLayout);

    res.json({ ok: true, data: { tempId, ...extractedLayout } });
  } catch (err) {
    console.error("External AI upload-sample error:", err);
    res.status(500).json({
      ok: false,
      message: "Lỗi phân tích ảnh mẫu",
      detail: err.message,
    });
  }
});

/**
 * 2️⃣ Gửi yêu cầu phong cách — chỉ lưu lại yêu cầu (không gọi AI)
 */
router.post("/generate-style", async (req, res) => {
  try {
    const { tempId, requirements } = req.body;
    if (!tempId || !requirements) {
      return res.status(400).json({ ok: false, message: "Thiếu dữ liệu" });
    }

    const ctx = SESS.get(tempId) || {};
    ctx.requirements = requirements;
    SESS.set(tempId, ctx);

    res.json({
      ok: true,
      message: "Đã lưu yêu cầu thiết kế thành công",
    });
  } catch (err) {
    console.error("Generate-style error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * 3️⃣ Upload ảnh nhà thật → Gọi External AI Services để phối cảnh
 */
router.post("/generate-final", upload.single("house"), async (req, res) => {
  const trxUserId = 1;
  try {
    const { tempId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ ok: false, message: "Thiếu ảnh nhà thô" });
    }
    if (!tempId || !SESS.has(tempId)) {
      return res.status(400).json({ ok: false, message: "Session không hợp lệ" });
    }

    const ctx = SESS.get(tempId);

    // Upload ảnh nhà thật lên Cloudinary
    const upHouse = await uploadBufferToCloudinary(file.buffer, "exterior_ai/houses");

    // Prompt tổng hợp
    const prompt = `
You are an AI architectural visualization designer.

Using the provided images (one raw construction house and one style reference),
generate a realistic exterior render of the *same building* with the following conditions:

1. Keep the **original structure, shape, proportions, and camera angle** exactly as in the raw house image.
   - Do not change the layout, height, number of floors, or window positions.
   - Use the scaffold photo as the fixed architectural base.

2. Apply the **style, materials, and atmosphere** inspired by the reference image:
   - Style: ${ctx.requirements?.style || "Modern"}
   - Color palette: ${ctx.requirements?.colorPalette || "cream white with wooden accents"}
   - Materials & decorations: ${ctx.requirements?.decorItems || "wooden slats, wall lamps"}
   - Additional suggestions: ${ctx.requirements?.aiSuggestions || "prioritize natural lighting, elegant bright tones"}

3. Improve realism by adding:
   - Clean finished walls and textures (no raw bricks)
   - Correct lighting and shadows
   - Subtle environment (sky, greenery, ground) similar to the reference

⚠️ Important:
Do not modify the structure or viewing angle of the house.
Focus only on finishing materials, color, and environment.
Render a professional, high-quality exterior visualization that matches the real scaffold.
`;


    // Gọi External AI Services để tạo ảnh - trả về 3 kết quả từ 3 services
    let imageResults;
    
    if (ctx.sampleImageBuffer) {
      // Có cả ảnh mẫu và ảnh nhà thô - sử dụng image-to-image generation
      // Tạm thời dùng generateImageExternal, có thể cải thiện sau
      const imageBuffer = await generateImageFromImages(
        file.buffer,           // ảnh nhà thô (source)
        file.mimetype,
        ctx.sampleImageBuffer, // ảnh mẫu (reference)
        ctx.sampleMimeType || "image/jpeg",
        prompt
      );
      // Nếu có ảnh mẫu, chỉ trả về 1 kết quả
      const upOutput = await uploadBufferToCloudinary(imageBuffer, "exterior_ai/outputs");
      imageResults = {
        stability: null,
        replicate: null,
        huggingface: null,
        single: upOutput.secure_url,
      };
    } else {
      // Chỉ có ảnh nhà thô, tạo 3 ảnh từ 3 services
      const results = await generateImageFromThreeServices(prompt, {
        width: 1024,
        height: 1024,
      });

      // Upload từng ảnh lên Cloudinary
      const uploadPromises = [];
      if (results.stability) {
        uploadPromises.push(
          uploadBufferToCloudinary(results.stability, "exterior_ai/outputs")
            .then(up => ({ service: 'stability', url: up.secure_url }))
            .catch(err => {
              console.error('[Upload] Stability AI image error:', err);
              return { service: 'stability', url: null };
            })
        );
      } else {
        uploadPromises.push(Promise.resolve({ service: 'stability', url: null }));
      }

      if (results.replicate) {
        uploadPromises.push(
          uploadBufferToCloudinary(results.replicate, "exterior_ai/outputs")
            .then(up => ({ service: 'replicate', url: up.secure_url }))
            .catch(err => {
              console.error('[Upload] Replicate image error:', err);
              return { service: 'replicate', url: null };
            })
        );
      } else {
        uploadPromises.push(Promise.resolve({ service: 'replicate', url: null }));
      }

      if (results.huggingface) {
        uploadPromises.push(
          uploadBufferToCloudinary(results.huggingface, "exterior_ai/outputs")
            .then(up => ({ service: 'huggingface', url: up.secure_url }))
            .catch(err => {
              console.error('[Upload] Hugging Face image error:', err);
              return { service: 'huggingface', url: null };
            })
        );
      } else {
        uploadPromises.push(Promise.resolve({ service: 'huggingface', url: null }));
      }

      const uploadedResults = await Promise.all(uploadPromises);
      imageResults = {
        stability: uploadedResults.find(r => r.service === 'stability')?.url || null,
        replicate: uploadedResults.find(r => r.service === 'replicate')?.url || null,
        huggingface: uploadedResults.find(r => r.service === 'huggingface')?.url || null,
        single: null,
      };
    }

    // Lưu ảnh đầu tiên có sẵn vào DB (hoặc ảnh single nếu có)
    const outputImageUrl = imageResults.single || 
                          imageResults.stability || 
                          imageResults.replicate || 
                          imageResults.huggingface;

    // Lưu lịch sử vào DB (lưu ảnh đầu tiên có sẵn)
    const pool = await getPool();
    await pool.request()
      .input("UserId", sql.BigInt, trxUserId)
      .input("InputImageUrl", sql.NVarChar(500), upHouse.secure_url)
      .input("OutputImageUrl", sql.NVarChar(500), outputImageUrl || "")
      .input("Style", sql.NVarChar(200), ctx.requirements?.style || "")
      .input("PromptUsed", sql.NVarChar(sql.MAX), prompt)
      .query(`
        INSERT INTO Generations (UserId, InputImageUrl, OutputImageUrl, Style, PromptUsed, CreatedAt)
        VALUES (@UserId, @InputImageUrl, @OutputImageUrl, @Style, @PromptUsed, SYSDATETIME());
      `);

    res.json({
      ok: true,
      data: {
        inputHouse: upHouse.secure_url,
        outputImages: imageResults, // Trả về 3 kết quả
        outputImage: outputImageUrl, // Giữ lại cho backward compatibility
      },
    });
  } catch (err) {
    console.error("External AI render error:", err);
    res.status(500).json({
      ok: false,
      message: "Lỗi sinh ảnh bằng External AI Services",
      detail: err.message,
    });
  }
});

module.exports = router;

