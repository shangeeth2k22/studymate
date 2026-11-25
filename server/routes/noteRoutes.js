const express = require("express");
const { createNote , getNotes , getNote , deleteNote, createSummary, createQuiz, createFlashcards } = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");
const uploadPdf = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/",protect,uploadPdf, createNote);
router.get("/",protect,getNotes);
router.get("/:id", protect , getNote);
router.delete("/:id",protect, deleteNote);
router.post("/:id/summary",protect,createSummary);
router.post("/:id/quiz", protect , createQuiz);
router.post("/:id/flashcards", protect , createFlashcards);

module.exports = router;