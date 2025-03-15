const express = require("express");
const multer = require("multer");
const {verifyToken} = require("../middleware/commonMiddleware");

const {
    getAllTables,
    createTable,
    getTableColumns,
    addColumnsToTable,
    addDataManually,
    uploadExcelData,
    getTableData
} = require("../controllers/tableController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Upload Excel file

router.get("/tables", getAllTables);                // Get all tables
router.post("/tables", verifyToken,createTable);               // Create new table
router.get("/tables/:tableName/columns", getTableColumns); // Get table columns
router.post("/tables/:tableName/columns",verifyToken, addColumnsToTable); // Add columns
router.post("/tables/:tableName/data",verifyToken, addDataManually); // Add data manually
router.post("/upload", upload.single("file"),verifyToken, uploadExcelData); // Upload Excel file
router.get("/tables/:tableName/data", getTableData);

module.exports = router;
