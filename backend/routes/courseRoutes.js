// src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController');

// 搜尋路由 (對應前端 handleSearch)
router.post('/search', CourseController.searchCourses);
router.post('/', CourseController.createCourse);
router.put('/:id', CourseController.updateCourse);
router.delete('/:id', CourseController.deleteCourse);
router.post('/import', CourseController.importCourses);
module.exports = router;