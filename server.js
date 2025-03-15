const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes.js");
// const allUserRoutes = require("./routes/allUserRoutes");
const studentRoutes = require('./routes/studentRoutes.js');
const teacherRoutes = require("./routes/teacherRoutes");
const questionRoutes = require('./routes/questionRoutes.js');
const queryRoutes = require("./routes/queryRoutes");
const {db , db_query } = require("./config/db.js");
const tableRoutes = require("./routes/tableRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const classmateRoutes = require("./routes/classmateRoutes.js");


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5175", credentials: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", allUserRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use('/api/questions', questionRoutes);
app.use("/api/query", queryRoutes);
app.use("/api", tableRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/classmates", classmateRoutes);

// Start server
const PORT = process.env.PORT || 5000;

// Test MySQL connection
// db.query("SELECT 1")
//   .then(() => {
//     console.log("Connected to MySQL database");
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   })
//   .catch((err) => {
//     console.error("Database connection failed:", err);
//   });


// db_query.query("SELECT 1")
// .then(() => {
//   console.log("Connected to MySQL database name db_query");
//   // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// })
// .catch((err) => {
//   console.error("Database db_query connection failed:", err);
// });



// Test SQL Project Database
app.get("/test-sql-project", async (req, res) => {
  try {
      const [rows] = await db.query("SELECT 1+1 AS result");
      res.json({ message: "SQL Project Database Connected!",  });
  } catch (error) {
      res.status(500).json({ error: "SQL Project Database connection failed!",details: error.message });
  }
});

// Test SQL Project Run Query Database
app.get("/test-sql-project-run", async (req, res) => {
  try {
      // const [rows] = await db_query.query("SELECT 1+1 AS result");
      res.json({ message: "SQL Project Run Query Database Connected!" });
  } catch (error) {
      res.status(500).json({ error: "SQL Project Run Query Database connection failed!",details: error.message });
  }
});


app.get("/users", async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM testing");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Database query failed" ,details: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));