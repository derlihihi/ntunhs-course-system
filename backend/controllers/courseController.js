// src/controllers/courseController.js
const CourseService = require('../services/courseService');

class CourseController {
    // 處理 POST /api/courses/search
    // 為什麼用 POST？因為 filters 包含很多陣列，用 GET URL 參數會太長且難處理
    static async searchCourses(req, res) {
        try {
            const filters = req.body; // 從 Body 拿篩選條件
            const results = await CourseService.search(filters);
            
            res.status(200).json(results);
        } catch (error) {
            console.error('Search Error:', error);
            res.status(500).json({ message: '伺服器查詢錯誤' });
        }
    }
}

module.exports = CourseController;