const express = require("express");
const router = express.Router();
const { executeQuery } = require("../controllers/queryController");
const {verifyToken} = require("../middleware/commonMiddleware");

// ✅ Protected route with authentication
router.post("/execute-query", verifyToken, executeQuery);

module.exports = router;
