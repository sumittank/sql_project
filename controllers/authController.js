const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {db} = require("../config/db");
require("dotenv").config();

const register = async (req, res) => {
    const { name, email, password, role, uniqueKey, enrollmentNo, session, branch, sem, classs, year } = req.body;
    const status = 'inactive'

    console.log(role);

    // Validate required fields for all users
    if (role !== "student" && (!name || !email || !password || !role || !uniqueKey)) {
        return res.status(400).json({ message: "Name, Email, Password, Role, and Unique Key are required." });
    }

    // Validate role-based required fields
    if (role === "student" && (!name || !email || !password || !enrollmentNo || !session || !branch || !sem || !classs || !year)) {
        return res.status(400).json({ message: "Students must provide session, branch, semester, class, and year." });
    }

    try {
        // Validate unique key based on role
        if (
            (role === "teacher" && uniqueKey !== process.env.UNIQUE_TEACHER_KEY) ||
            (role === "admin" && uniqueKey !== process.env.UNIQUE_ADMIN_KEY)
        ) {
            return res.status(403).json({ message: "Invalid unique key for the given role" });
        }

        // Check if the user already exists
        const [existingUser] = await db.query("SELECT * FROM all_users WHERE Email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate a unique ID for the user
        const userId = crypto.randomUUID(); // Generates a unique user ID

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get the current date-time for registration
        const createdAt = new Date().toISOString().slice(0, 19).replace("T", " "); // Format for MySQL DATETIME

        // Insert user into the database based on role
        if (role === "student") {
            await db.query(
                "INSERT INTO all_users (UserId, Name, EnrollmentNo, Session, Branch, Year, Semester, Class, Email, Password, Role, Status , CreatedAt) VALUES (? ,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
                [userId, name, enrollmentNo, session, branch, year, sem, classs, email, hashedPassword, role, status , createdAt]
            );
        }
        else if (role === "teacher"){
            await db.query(
                "INSERT INTO all_users (UserId, Name, Email, Password, Role, Status, CreatedAt) VALUES (?, ?, ?, ?, ?, ?,?)",
                [userId, name, email, hashedPassword, role, status , createdAt]
            );
        } 
        
        else if (role === "admin"){
            await db.query(
                "INSERT INTO all_users (UserId, Name, Email, Password, Role,  CreatedAt) VALUES (?, ?, ?, ?, ?, ?)",
                [userId, name, email, hashedPassword, role, createdAt]
            );   
        }

        res.status(201).json({ message: "User registered successfully", userId, createdAt });
    } catch (error) {
        // console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// User Login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [user] = await db.query("SELECT * FROM all_users WHERE Email = ?", [email]);

        if (user.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if(user[0].Status === 'inactive' && user[0].Role === 'student'){
            return res.status(401).json({message : "Wait for Approval"})
        }

        if(user[0].Status === 'inactive' && user[0].Role === 'teacher'){
            return res.status(401).json({message : "Wait for Approval"})
        }

        const isMatch = await bcrypt.compare(password, user[0].Password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user[0].UserId,
                role: user[0].Role,
                email: user[0].Email,
                session: user[0].Session,
                branch: user[0].Branch,
                year: user[0].Year,
                semester: user[0].Semester,
                classs: user[0].Class
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                userId: user[0].UserId,
                role: user[0].Role,
                email: user[0].Email,
                session: user[0].Session,
                branch: user[0].Branch,
                year: user[0].Year,
                semester: user[0].Semester,
                classs: user[0].Class
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// User Logout
const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
};


module.exports = {
    register,
    login,
    logout,
};