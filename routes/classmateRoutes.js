const express = require("express");
const { getRankedClassmates } = require("../controllers/classmateController");
const router = express.Router();

// 🎯 Get Ranked Classmates  
router.get("/get-classmates", getRankedClassmates);

module.exports = router;
