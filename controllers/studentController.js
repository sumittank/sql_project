const {db} = require("../config/db");
const jwt = require('jsonwebtoken');


// Get all  students
const getAllStudents = async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM all_users WHERE Role = 'student' ");
        if (users.length === 0) return res.status(404).json({ message: "No students found" });
        res.json(users);
    } catch (error) {
        // console.error("Error fetching students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Get user by ID
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [user] = await db.query("SELECT * FROM all_users WHERE UserId = ?", [id]);
        if (user.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(user[0]);
    } catch (error) {
        // console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get user by Email
const getUserByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const [user] = await db.query("SELECT * FROM all_users WHERE Email = ?", [email]);
        if (user.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(user[0]);
    } catch (error) {
        // console.error("Error fetching user by Email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get users by Status (Active/Inactive)
const getUsersByStatus = async (req, res) => {
    const { status } = req.params;
    try {
        const [users] = await db.query("SELECT * FROM all_users WHERE Status = ?", [status]);
        if (users.length === 0) return res.status(404).json({ message: "No users found with this status" });
        res.json(users);
    } catch (error) {
        // console.error("Error fetching users by status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Activate Student by ID
const activateStudent = async (req, res) => {
    const { id } = req.params; // Get student ID from URL

    try {
        // Verify JWT token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden: Invalid token" });
            }

            // Update student status in the database
            const [result] = await db.query("UPDATE all_users SET Status = 'active' WHERE UserId = ?", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Student not found or already active" });
            }

            res.status(200).json({ message: "Student activated successfully!" });
        });
    } catch (error) {
        // console.error("Activation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Deactivate Student by ID
const deActivateStudent = async (req, res) => {
    const { id } = req.params; // Get student ID from URL

    try {
        // Verify JWT token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden: Invalid token" });
            }

            // Update student status in the database
            const [result] = await db.query("UPDATE all_users SET Status = 'inactive' WHERE UserId = ?", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Student not found or already inactive" });
            }

            res.status(200).json({ message: "Student activated successfully!" });
        });
    } catch (error) {
        // console.error("Activation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete an active student by ID
const deleteActiveStudent = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if student exists and is active
        const [student] = await db.query("SELECT * FROM all_users WHERE UserId = ? AND Status = 'active'", [id]);

        if (student.length === 0) {
            return res.status(404).json({ message: "Student not found or not active" });
        }

        // Delete student from the database
        await db.query("DELETE FROM all_users WHERE UserId = ?", [id]);

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        // console.error("Error deleting student:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get unique filter options (session, branch, year, semester, class)
const getFilterOptions = async (req, res) => {
    try {
      const [filters] = await db.query(
        "SELECT DISTINCT session, branch, year, semester, class FROM all_users WHERE Role = 'Student'"
      );
      res.json(filters);
    } catch (error) {
    //   console.error("Error fetching filter options:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };




module.exports = {getAllStudents , getUserById, getUserByEmail, getUsersByStatus , activateStudent , deActivateStudent ,deleteActiveStudent , getFilterOptions };
