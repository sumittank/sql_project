const {db_query} = require("../config/db");
const db = db_query

const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

// 🚀 Get all tables
const getAllTables = async (req, res) => {
    try {
        const [tables] = await db.query("SHOW TABLES");
        const tableNames = tables.map(row => Object.values(row)[0]);
        res.json({ tables: tableNames });
    } catch (error) {
        // console.error("Error fetching tables:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🚀 Create a new table
const createTable = async (req, res) => {
    const { tableName } = req.body;
    if (!tableName) return res.status(400).json({ message: "Table name is required" });

    try {
        await db.query(`CREATE TABLE ${tableName} (dummy_col_you_can_delete INT)`);
        // await db.query(`CREATE TABLE ${tableName} `);
        res.json({ message: `Table '${tableName}' created successfully!` });
    } catch (error) {
        // console.error("Error creating table:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



    

// 🚀 Get columns of a selected table
const getTableColumns = async (req, res) => {
    const { tableName } = req.params;
    try {
        const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
        res.json({ columns });
    } catch (error) {
        // console.error("Error fetching columns:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🚀 Add columns to an existing table
const addColumnsToTable = async (req, res) => {
    const { tableName } = req.params;
    const { columns } = req.body;

    if (!columns || columns.length === 0) return res.status(400).json({ message: "Columns are required" });

    try {
        for (const column of columns) {
            const { name, type, size, customSize } = column;
            const newSize = (customSize ? (customSize && customSize.trim() !== "" ? customSize : size ) : size)
            // console.log("hii",newSize)
            await db.query(`ALTER TABLE ${tableName} ADD ${name} ${type}(${newSize})`);
        }
        res.json({ message: "Columns added successfully!" });
    } catch (error) {
        // console.error("Error adding columns:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🚀 Add data manually to a table
const addDataManually = async (req, res) => {
    const { tableName } = req.params;
    const { data } = req.body;

    if (!data || data.length === 0) return res.status(400).json({ message: "Data is required" });

    try {
        const columns = Object.keys(data[0]).join(", ");
        const values = data.map(row => `(${Object.values(row).map(value => `'${value}'`).join(", ")})`).join(", ");
        await db.query(`INSERT INTO ${tableName} (${columns}) VALUES ${values}`);
        res.json({ message: "Data added successfully!" });
    } catch (error) {
        // console.error("Error adding data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const uploadExcelData = async (req, res) => {
    try {
      // console.log("File Upload Request Received");
      // console.log("File Data:", req.file);
      // console.log("Request Body:", req.body);
  
      const { tableName } = req.body;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      if (!tableName) {
        return res.status(400).json({ message: "Table name not provided" });
      }
  
      // Compute the absolute file path
      const filePath = path.join(__dirname, "..", req.file.path);
      // console.log("Computed file path:", filePath);
  
      // Check if file exists before reading it
      if (!fs.existsSync(filePath)) {
        // console.error("File does not exist at:", filePath);
        return res.status(400).json({ message: "Uploaded file not found on server" });
      }
  
      // Read the uploaded Excel file
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  
      // Get the first sheet from the workbook
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return res.status(400).json({ message: "Invalid Excel file. No sheets found." });
      }
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        return res.status(400).json({ message: "Error reading sheet data." });
      }
  
      // Convert sheet data to JSON
      const excelData = xlsx.utils.sheet_to_json(sheet);
      if (!excelData || excelData.length === 0) {
        return res.status(400).json({ message: "No data found in the Excel file." });
      }
    // Prepare data for bulk insertion.
// Get all keys from the first row of excel data.
let allColumns = Object.keys(excelData[0]); // e.g., [ 'id', 'col_1', 'col_2' ]

// Remove the primary key column ("id"), assuming it is auto-incremented.
let columns = allColumns.filter(col => col.toLowerCase() !== "id");

// Prepare the values using only the remaining columns
const values = excelData.map(row => columns.map(col => row[col]));

// console.log("Inserting data into table:", tableName);
// console.log("Columns:", columns);
// console.log("Values:", values);

// Build the bulk insert query safely
const tableEscaped = db.escapeId(tableName);
const columnList = columns.map(col => db.escapeId(col)).join(", ");
const insertQuery = `INSERT INTO ${tableEscaped} (${columnList}) VALUES ?`;
// console.log("Insert Query:", insertQuery);

  
      // Get a connection from your pool and execute the query.
      const connection = await db.getConnection();
      try {
        await connection.query(insertQuery, [values]);
        // console.log("Data inserted successfully into table:", tableName);
      } finally {
        connection.release();
      }
  
      // Delete the uploaded file from the server after processing
      fs.unlink(filePath, (err) => {
        if (err) {
          // console.error("Error deleting file:", err);
        } else {
          // console.log("File deleted successfully:", filePath);
        }
      });
  
      res.status(200).json({ message: "Excel data uploaded and processed successfully!" });
    } catch (error) {
      // console.error("Error processing file:", error);
      res.status(500).json({ message: "Server error while processing file." });
    }
  };
  
 
const getTableData = async (req, res) => {
  const { tableName } = req.params;
  const { limit } = req.query;
  // console.log(tableName,limit)
  try {
      let sqlQuery = `SELECT * FROM ??`;  
      let queryParams = [tableName];

      // If "limit" is provided, add LIMIT condition
      if (limit) {
          sqlQuery += ` LIMIT ?`;
          queryParams.push(parseInt(limit, 10));
      }

      // Execute the query
      const [rows] = await db.query(sqlQuery, queryParams);

      res.json({ data: rows });
  } catch (error) {
      // console.error("Error fetching table data:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};





module.exports = {
    getAllTables,
    createTable,
    getTableColumns,
    addColumnsToTable,
    addDataManually,
    uploadExcelData,
    getTableData
};


