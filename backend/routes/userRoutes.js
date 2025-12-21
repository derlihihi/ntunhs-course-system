// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// PATCH /api/users/:id/status
router.patch('/:id/status', UserController.updateUserStatus);

module.exports = router;