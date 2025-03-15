const express = require('express');
const router = express.Router();
const multer = require("multer");

const { addQuestion, uploadQuestions, getQuestionsByLevel ,getAllQuestions , deleteQuestion } = require("../controllers/questionController");
const { verifyToken } = require("../middleware/commonMiddleware");

// Fix multer storage
const storage = multer.diskStorage({ // Change to diskStorage
    destination: (req, file, cb) => {
        cb(null, "./uploads/"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });
// Routes
router.post('/add', verifyToken, addQuestion);
router.post('/upload-excel',  verifyToken,upload.single("file"), uploadQuestions); // Attach multer middleware here

// router.get('/:level', verifyToken,getQuestionsByLevel);
router.get('/all',verifyToken, getAllQuestions);

router.delete("/:questionId", deleteQuestion);


module.exports = router;

