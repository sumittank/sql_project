const express = require("express");
const {getAllTeachers, getAllEntry, addNewEntry ,removeEntry , activateTeacher ,getTeachersByStatus ,deActivateTeacher ,deleteActiveTeacher  } = require("../controllers/teacherController");
const { verifyToken } = require("../middleware/teacherMiddleware");

const router = express.Router();

router.get("/all-teachers",getAllTeachers )
router.get("/get-entries",getAllEntry )
router.post("/add-entry",addNewEntry)
router.delete("/remove-entry/:type/:entry",removeEntry)

router.get("/status/:status", verifyToken, getTeachersByStatus);
router.put("/activate-teacher/:id", verifyToken, activateTeacher);
router.put("/inactivate-teacher/:id", verifyToken, deActivateTeacher);
router.delete("/delete-active-teacher/:id",verifyToken,deleteActiveTeacher)

module.exports = router;
