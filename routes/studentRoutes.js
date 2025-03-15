const express = require("express");
const {getAllStudents, getUserById, getUserByEmail, getUsersByStatus , activateStudent ,deActivateStudent ,deleteActiveStudent ,getFilterOptions} = require("../controllers/studentController");
const { verifyToken } = require("../middleware/studentMiddleware");

const router = express.Router();

// Routes
router.get("/all-students", verifyToken, getAllStudents);
router.get("/id/:id", verifyToken, getUserById);
router.get("/email/:email", verifyToken, getUserByEmail);
router.get("/status/:status", verifyToken, getUsersByStatus);
router.put("/activate-student/:id", verifyToken, activateStudent);
router.put("/inactivate-student/:id", verifyToken, deActivateStudent);
router.delete("/delete-active-student/:id",verifyToken,deleteActiveStudent)
router.get("/filter-options", getFilterOptions);

module.exports = router;
