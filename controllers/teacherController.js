const {db} = require("../config/db");
const jwt = require('jsonwebtoken');


//get all teachers
const getAllTeachers =async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM all_users WHERE Role = 'teacher'");
    res.json(rows);
  } catch (error) {
    // console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ Get all entries
const getAllEntry =async (req, res) => {
  try {
    const [rows] = await db.query("SELECT Entry, Identifier	 FROM branches_classes_session");
    res.json(rows);
  } catch (error) {
    // console.error("Error fetching entries:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Add new entry
const addNewEntry = async (req, res) => {
  try {
    const entries = req.body;

    if (!entries || !entries.length) {
      return res.status(400).json({ message: "At least one entry is required." });
    }

    const values = entries.map(({ entry, type }) => [entry, type]);

    await db.query("INSERT INTO branches_classes_session (Entry, Identifier	) VALUES ?", [values]);
    res.status(201).json({ message: "Entries added successfully" });
  } catch (error) {
    // console.error("Error adding entries:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Remove an entry
const removeEntry = async (req, res) => {
  const { type, entry } = req.params;

  try {
    const sql = "DELETE FROM branches_classes_session WHERE Entry = ? AND Identifier	 = ?";
    const [result] = await db.query(sql, [entry, type]);

    if (result.affectedRows > 0) {
      res.json({ message: `Entry removed successfully` });
    } else {
      res.status(404).json({ message: "Entry not found" });
    }
  } catch (error) {
    // console.error("Error removing entry:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Activate Student by ID
const activateTeacher = async (req, res) => {
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
            const [result] = await db.query("UPDATE all_users SET Status = 'active' WHERE UserId = ? and Role = 'teacher'", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Teacher not found or already active" });
            }

            res.status(200).json({ message: "Teacher activated successfully!" });
        });
    } catch (error) {
        // console.error("Activation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Get users by Status (Active/Inactive)
const getTeachersByStatus = async (req, res) => {
  const { status } = req.params;
  try {
      const [users] = await db.query("SELECT * FROM all_users WHERE Status = ? and Role = 'teacher' ", [status]);
      if (users.length === 0) return res.status(404).json({ message: "No Teacher found with this status" });
      res.json(users);
  } catch (error) {
      // console.error("Error fetching Teachers by status:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};



// Deactivate Student by ID
const deActivateTeacher = async (req, res) => {
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
            const [result] = await db.query("UPDATE all_users SET Status = 'inactive' WHERE UserId = ? and Role = 'teacher' ", [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Teacher not found or already inactive" });
            }

            res.status(200).json({ message: "Teacher activated successfully!" });
        });
    } catch (error) {
        // console.error("Activation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete an active student by ID
const deleteActiveTeacher = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if student exists and is active
        const [teacher] = await db.query("SELECT * FROM all_users WHERE UserId = ? AND Status = 'active' And Role = 'teacher' ", [id]);

        if (teacher.length === 0) {
            return res.status(404).json({ message: "Teacher not found or not active" });
        }

        // Delete student from the database
        await db.query("DELETE FROM all_users WHERE UserId = ? and role = 'teacher' ", [id]);

        res.json({ message: "Teacher deleted successfully" });
    } catch (error) {
        // console.error("Error deleting teacher:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




module.exports = {  getAllTeachers, getAllEntry, addNewEntry ,removeEntry , activateTeacher ,getTeachersByStatus
  ,deActivateTeacher ,deleteActiveTeacher 
 };
