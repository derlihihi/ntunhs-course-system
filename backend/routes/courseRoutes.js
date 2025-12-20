// src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController');

// 搜尋路由 (對應前端 handleSearch)
router.post('/search', CourseController.searchCourses);

module.exports = router;