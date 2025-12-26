const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth"); // Middleware xác thực JWT của bạn
const { saveDesign, getDesign } = require("../services/designService");
const asyncHandler = require("../middlewares/asyncHandler");

// API Lưu phối màu: POST /api/visualizer/save
router.post("/save", auth, asyncHandler(async (req, res) => {
  const { generationId, configJson } = req.body;
  const userId = req.user.id; // Lấy ID người dùng từ Token đã decode

  if (!generationId || !configJson) {
    return res.status(400).json({ ok: false, message: "Thiếu dữ liệu đầu vào" });
  }

  await saveDesign(generationId, userId, configJson);
  
  res.ok({ message: "Đã lưu bản phối màu thành công" });
}));

// API Lấy phối màu cũ: GET /api/visualizer/:generationId
router.get("/:generationId", auth, asyncHandler(async (req, res) => {
  const { generationId } = req.params;
  const design = await getDesign(generationId);

  if (!design) {
    return res.ok({ config: null });
  }

  // (Optional) Kiểm tra bảo mật: Nếu không phải chủ sở hữu thì không cho xem
  // if (design.UserId !== req.user.id) {
  //   return res.status(403).json({ ok: false, message: "Bạn không có quyền xem bản phối này" });
  // }

  res.ok({ 
    config: JSON.parse(design.ConfigJson) 
  });
}));

module.exports = router;