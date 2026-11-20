const express = require("express");
const { createNote } = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");
const uploadPdf = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/",protect,uploadPdf, createNote);

module.exports = router;