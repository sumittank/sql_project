const express = require('express');
const { register, login, logout ,getUserProfile } = require('../controllers/authController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const router = express.Router();

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Logout user
router.post("/logout", logout);

module.exports = router;
