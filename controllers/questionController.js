const {db} = require("../config/db");
const jwt = require('jsonwebtoken');
const multer = require('multer');
const xlsx = require('xlsx');

const fs = require("fs");
const path = require("path");


const addQuestion = async (req, res) => {
    console.log("Received request to add question"); // ✅ Debugging log

    const { text, level , expectedQuery } = req.body;

    // ✅ Ensure both text and level are provided
    if (!text || !level || !expectedQuery) {
        return res.status(400).json({ success: false, message: "Question text, expected query and level are required" });
    }

    const sql = "INSERT INTO questions (Text, Level , ExpectedQuery) VALUES (?, ?, ?)";

    try {
        const [result] = await db.query(sql, [text, level.toLowerCase() , expectedQuery ]); // ✅ Await the query
        // console.log("Question Added:", { id: result.insertId, text, level ,expectedQuery});

        res.json({ success: true, message: "Question added successfully", id: result.insertId });
    } catch (error) {
        // console.error("Database Error:", error);
        res.status(500).json({ success: false, message: "Error adding question", error: error.message });
    }
};


const uploadQuestions = async (req, res) => {
    try {
        // console.log("File Upload Request Received");
        // console.log("File Data:", req.file);
        // console.log("User Data:", req.user);

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Ensure the correct file path
        const filePath = path.join(__dirname, "..", req.file.path);
        // console.log("Reading file from:", filePath);

        // Read the uploaded Excel file
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = xlsx.read(fileBuffer, { type: "buffer" });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return res.status(400).json({ message: "Invalid Excel file. No sheets found." });
        }

        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            return res.status(400).json({ message: "Error reading sheet data." });
        }

        // Convert sheet to JSON
        const questions = xlsx.utils.sheet_to_json(sheet);
        // console.log("Extracted Questions:", questions);

        if (questions.length === 0) {
            return res.status(400).json({ message: "No data found in the file." });
        }

        // ✅ Insert data into MySQL database
        const connection = await db.getConnection();
        try {
            const insertQuery = "INSERT INTO questions (Text, Level , ExpectedQuery ) VALUES ?";
            const values = questions.map(q => [q.Text, q.Level , q.ExpectedQuery]); // Adjust column names

            await connection.query(insertQuery, [values]);
            // console.log("✅ Data inserted successfully into the database!");
        } finally {
            connection.release();
        }

        // ✅ Delete the uploaded file from local storage
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("✅ File deleted successfully!");
            }
        });

        res.status(200).json({ message: "File processed and data uploaded successfully!" });

    } catch (error) {
        // console.error("Error processing file:", error);
        res.status(500).json({ message: "Server error while processing file." });
    }
};

// Fetch questions by level
const getQuestionsByLevel = (req, res) => {
  const { level } = req.params;
  const sql = 'SELECT * FROM questions WHERE Level = ?';

  db.query(sql, [level], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching questions', err });
    res.json(results);
  });
};


const getAllQuestions = async (req, res) => {
 
    const sql = "SELECT * FROM questions";

    try {
        const [results] = await db.query(sql); // ✅ Await the query properly
        // console.log("Query Results:", results);

        const categorizedQuestions = { basic: [], medium: [], advanced: [] };

        results.forEach((question) => {
            const level = question.Level.toLowerCase();
            if (categorizedQuestions[level]) {
                categorizedQuestions[level].push({
                    QuestionId: question.QuestionId,
                    Text: question.Text,
                    ExpectedQuery : question.ExpectedQuery
                });
            }
        });

        res.json(categorizedQuestions);
    } catch (error) {
        // console.error("Unexpected Error:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};


// Delete a question
const deleteQuestion = async (req, res) => {
    const { questionId } = req.params;
  
    try {
      const [result] = await db.query("DELETE FROM questions WHERE QuestionId = ?", [questionId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Question not found" });
      }
  
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
    //   console.error("Error deleting question:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };




module.exports = { addQuestion ,uploadQuestions , getQuestionsByLevel,getAllQuestions , deleteQuestion};
