const {db} = require("../config/db");

// 🚀 Function to record expected query button clicks
const trackExpectedQueryClick = async (req, res) => {
    try {
        const email = req.body.email; // Fetch email from request body
        if (!email) return res.status(400).json({ message: "Email is required" });

        // Insert new record if not exists, else update the count
        await db.query(
            `INSERT INTO user_query_stats (email, expected_query_clicks) 
             VALUES (?, 1) 
             ON DUPLICATE KEY UPDATE expected_query_clicks = expected_query_clicks + 1`,
            [email]
        );

        res.json({ message: "Expected query click recorded successfully" });
    } catch (error) {
        // console.error("Error tracking expected query clicks:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🚀 Function to track successful query execution
const trackSuccessfulQuery = async (req, res) => {
    try {
        const email = req.body.email; // Fetch email from request body
        if (!email) return res.status(400).json({ message: "Email is required" });

        // Insert new record if not exists, else update the count
        await db.query(
            `INSERT INTO user_query_stats (email, total_queries, successful_queries) 
             VALUES (?, 1, 1) 
             ON DUPLICATE KEY UPDATE 
             total_queries = total_queries + 1, 
             successful_queries = successful_queries + 1`,
            [email]
        );

        res.json({ message: "Successful query execution recorded successfully" });
    } catch (error) {
        // console.error("Error tracking successful query execution:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🚀 Function to get user analytics
const getUserAnalytics = async (req, res) => {
    try {
        const email = req.params.email; // Fetch email from request params
        if (!email) return res.status(400).json({ message: "Email is required" });

        const [rows] = await db.query(`SELECT * FROM user_query_stats WHERE email = ?`, [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No analytics found for this user" });
        }

        res.json(rows[0]);
    } catch (error) {
        // console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🚀 Function to update user analytics
const updateUserAnalytics = async (req, res) => {
    try {
        const { email, expectedQueryClickCount, successfulQueryCount } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // First, check if the user already has analytics data
        const [rows] = await db.query(`SELECT * FROM user_query_stats WHERE email = ?`, [email]);

        if (rows.length > 0) {
            // If data exists, update it by incrementing values
            await db.query(
                `UPDATE user_query_stats 
                 SET expectedQueryClickCount =  ?, 
                     successfulQueryCount =  ? 
                 WHERE email = ?`,
                [expectedQueryClickCount || 0, successfulQueryCount || 0, email]
            );
        } else {
            // If no data exists, insert new row
            await db.query(
                `INSERT INTO user_query_stats (email, expectedQueryClickCount, successfulQueryCount) 
                 VALUES (?, ?, ?)`,
                [email, expectedQueryClickCount || 0, successfulQueryCount || 0]
            );
        }

        res.json({ success: true, message: "Analytics updated successfully" });
    } catch (error) {
        // console.error("Error updating analytics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const recordQuestionAttempt = async (req, res) => {
    try {
        const { email, questionId } = req.body;
        if (!email || !questionId) {
            return res.status(400).json({ message: "Email and questionId are required" });
        }

        // Check if the user has already attempted this question
        const [existingAttempt] = await db.query(
            `SELECT * FROM student_analytics WHERE email = ? AND questionId = ?`,
            [email, questionId]
        );

        if (existingAttempt.length > 0) {
            return res.status(200).json({ message: "Already attempted" });
        }

        // Insert new attempt
        await db.query(`INSERT INTO student_analytics (email, questionId) VALUES (?, ?)`, [email, questionId]);

        res.status(200).json({ message: "Attempt recorded successfully" });
    } catch (error) {
        // console.error("Error recording question attempt:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const getStudentAnalytics = async (req, res) => {
    try {
        const email = req.params.email; // Fetch email from request params
        if (!email) return res.status(400).json({ message: "Email is required" });

        const [rows] = await db.query(`SELECT * FROM student_analytics WHERE email = ?`, [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No analytics found for this user" });
        }

        res.json(rows);
    } catch (error) {
        // console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// 🚀 Update Attempted Questions for a Student (Only If Correct Query)
const updateAttemptedQuestions = async (req, res) => {
    try {
        const { email, attemptedQuestions } = req.body;
        if (!email || !attemptedQuestions) {
            return res.status(400).json({ message: "Email and attemptedQuestions are required" });
        }

        const jsonAttempts = JSON.stringify(attemptedQuestions);

        // ✅ Check if student already exists in the database
        const [existing] = await db.query(`SELECT * FROM student_analytics WHERE email = ?`, [email]);

        if (existing.length > 0) {
            // ✅ Update JSON field if record exists
            await db.query(`UPDATE student_analytics SET attemptedQuestions = ? WHERE email = ?`, [jsonAttempts, email]);
        } else {
            // ✅ Insert new record if student does not exist
            await db.query(`INSERT INTO student_analytics (email, attemptedQuestions) VALUES (?, ?)`, [email, jsonAttempts]);
        }

        res.json({ success: true, message: "Attempted questions updated successfully!" });
    } catch (error) {
        // console.error("Error updating analytics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const trackQueryView = async (req, res) => {
    try {
        const { email, questionId } = req.body;

        if (!email || !questionId) {
            return res.status(400).json({ message: "Email and questionId are required" });
        }

        console.log(`📩 Received API call - Email: ${email}, Question ID: ${questionId}`);

        // ✅ Check if student exists
        const [existing] = await db.query(`SELECT * FROM student_analytics WHERE email = ?`, [email]);
        // console.log(`🔍 Query Result:`, existing);

        let updatedViewedQueries = [];

        if (existing.length > 0 && existing[0].viewedQueries) {
            updatedViewedQueries = JSON.parse(existing[0].viewedQueries);
        }

        // ✅ Prevent duplicate tracking
        if (!updatedViewedQueries.includes(questionId)) {
            updatedViewedQueries.push(questionId);
        }

        if (existing.length > 0) {
            // ✅ Update existing record
            // console.log(`🔄 Updating existing record for ${email}`);
            await db.query(`UPDATE student_analytics SET viewedQueries = ? WHERE email = ?`, 
                [JSON.stringify(updatedViewedQueries), email]);
            console.log(`✅ Updated viewed queries: ${updatedViewedQueries}`);
        } else {
            // ✅ Insert new record
            // console.log(`➕ Inserting new record for ${email}`);
            await db.query(`INSERT INTO student_analytics (email, viewedQueries) VALUES (?, ?)`, 
                [email, JSON.stringify([questionId])]);
            // console.log(`✅ Inserted new record`);
        }

        res.json({ success: true, message: "Query view tracked successfully!" });

    } catch (error) {
        // console.error("❌ Detailed Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// 🚀 Get Attempted Questions for a Student
const getAttemptedQuestions = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const [rows] = await db.query(`SELECT attemptedQuestions FROM student_analytics WHERE email = ?`, [email]);

        if (rows.length === 0) {
            return res.json({ attemptedQuestions: [] }); // No record found, return empty array
        }

        res.json({ attemptedQuestions: JSON.parse(rows[0].attemptedQuestions) });
    } catch (error) {
        // console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🚀 Get All Analytics Data for a Student
const getStudentAnalyticsQueryView = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email is required" });

        // ✅ Fetch attemptedQuestions, viewedQueries, and viewedQuestions for the student
        const [rows] = await db.query(
            `SELECT attemptedQuestions, viewedQueries, viewedQuestions FROM student_analytics WHERE email = ?`, 
            [email]
        );

        if (rows.length === 0) {
            return res.json({ 
                attemptedQuestions: [], 
                viewedQueries: [], 
                viewedQuestions: []  // Include the new field
            });
        }

        res.json({
            attemptedQuestions: rows[0].attemptedQuestions ? JSON.parse(rows[0].attemptedQuestions) : [],
            viewedQueries: rows[0].viewedQueries ? JSON.parse(rows[0].viewedQueries) : [],
            viewedQuestions: rows[0].viewedQuestions ? JSON.parse(rows[0].viewedQuestions) : [] // New column included
        });
    } catch (error) {
        // console.error("❌ Error fetching student analytics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getViewQuestions = async (req, res) => {
    try {
        const { email, questionId } = req.body;

        if (!email || !questionId) {
            return res.status(400).json({ message: "Email and questionId are required" });
        }

        // console.log(`📩 Received API call - Email: ${email}, Question ID: ${questionId}`);

        // ✅ Check if the student already exists in the database
        const [existing] = await db.query(`SELECT * FROM student_analytics WHERE email = ?`, [email]);

        let updatedViewedQuestions = [];

        if (existing.length > 0) {
            // ✅ If student exists, get viewedQuestions
            if (existing[0].viewedQuestions) {
                updatedViewedQuestions = JSON.parse(existing[0].viewedQuestions);
            }
        } else {
            // ✅ If student does NOT exist, insert a new record with default values
            // console.log(`➕ Inserting new record for ${email}`);

            const defaultAttempts = JSON.stringify([]); // Default empty array for `attemptedQuestions`
            const defaultViewed = JSON.stringify([questionId]); // Initialize `viewedQuestions` with the first question

            await db.query(
                `INSERT INTO student_analytics (email, attemptedQuestions, viewedQuestions) VALUES (?, ?, ?)`,
                [email, defaultAttempts, defaultViewed]
            );

            // console.log(`✅ New student record created for ${email} with first viewed question: ${questionId}`);

            return res.json({ success: true, message: "Viewed question tracked successfully!" });
        }

        // ✅ Prevent duplicate question entries
        if (!updatedViewedQuestions.includes(questionId)) {
            updatedViewedQuestions.push(questionId);

            // ✅ Update the record in the database
            await db.query(
                `UPDATE student_analytics SET viewedQuestions = ? WHERE email = ?`, 
                [JSON.stringify(updatedViewedQuestions), email]
            );

            // console.log(`✅ Updated viewed questions: ${updatedViewedQuestions}`);
        } else {
            // console.log(`ℹ️ Question ID ${questionId} already viewed.`);
        }

        res.json({ success: true, message: "Viewed question tracked successfully!" });
    } catch (error) {
        // console.error("❌ Error updating viewed questions:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get student analytics
const getStudentAnalyticsAll = async (req, res) => {
    try {
      const [analytics] = await db.query("SELECT * FROM student_analytics");
      res.json(analytics);
    } catch (error) {
    //   console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

module.exports = { 
    trackExpectedQueryClick, 
    trackSuccessfulQuery, 
    getUserAnalytics , 
    updateUserAnalytics,
    recordQuestionAttempt,
    getStudentAnalytics,
    updateAttemptedQuestions,
    trackQueryView,
    getAttemptedQuestions,
    getStudentAnalyticsQueryView,
    getViewQuestions,
    getStudentAnalyticsAll
};
