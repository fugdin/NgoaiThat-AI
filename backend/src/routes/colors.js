const express = require("express");
const router = express.Router();
const { getAllColors } = require("../services/colorService");
const asyncHandler = require("../middlewares/asyncHandler");

// API: GET /api/colors
router.get("/", asyncHandler(async (req, res) => {
  const colors = await getAllColors();
  res.ok({ colors }); // Sử dụng res.ok đã định nghĩa trong app.js của bạn
}));

module.exports = router;